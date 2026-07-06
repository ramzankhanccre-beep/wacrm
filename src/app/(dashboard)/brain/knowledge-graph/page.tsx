"use client";

import { useEffect, useState } from 'react';
import { RefreshCw, Layers, ArrowRight, User, Package, Building, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface GraphEntity {
  id: string;
  entity_type: string;
  entity_id: string;
  name: string;
  description: string | null;
  properties: Record<string, unknown>;
}

interface GraphRelation {
  id: string;
  from_entity_id: string;
  to_entity_id: string;
  relation_type: string;
}

const entityTypeIcons: Record<string, typeof User> = {
  contact: User,
  company: Building,
  product: Package,
  conversation: MessageSquare,
};

const entityTypeLabels: Record<string, string> = {
  contact: 'Contact',
  company: 'Company',
  product: 'Product',
  deal: 'Deal',
  conversation: 'Conversation',
  agent: 'Agent',
  team: 'Team',
  policy: 'Policy',
};

export default function KnowledgeGraphPage() {
  const { profileLoading } = useAuth();
  const [entities, setEntities] = useState<GraphEntity[]>([]);
  const [relations, setRelations] = useState<GraphRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadGraph();
  }, [selectedType]);

  async function loadGraph() {
    setLoading(true);
    try {
      const url = selectedType === 'all'
        ? '/api/brain/knowledge-graph?relations=true'
        : `/api/brain/knowledge-graph?entityType=${selectedType}&relations=true`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error);
      setEntities(Array.isArray(data.entities) ? data.entities : []);
      setRelations(Array.isArray(data.relations) ? data.relations : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center px-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const byType = entities.reduce((acc, e) => {
    acc[e.entity_type] = (acc[e.entity_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const entityMap = new Map(entities.map(e => [e.id, e]));

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-100">Knowledge Graph</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Universal entity relationships.
            </h1>
          </div>
          <Button variant="ghost" onClick={loadGraph}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
        <p className="max-w-3xl text-slate-400">
          Visual graph of all connected entities: contacts, companies, products, deals, and more.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-800">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 text-sm font-medium transition ${selectedType === 'all' ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
        >
          All ({entities.length})
        </button>
        {Object.keys(entityTypeLabels).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 text-sm font-medium transition ${selectedType === type ? 'border-b-2 border-primary text-white' : 'text-slate-400'}`}
          >
            {entityTypeLabels[type]} ({byType[type] || 0})
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(entityTypeLabels).map(([type, label]) => {
          const Icon = entityTypeIcons[type]
          return (
            <div key={type} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {Icon ? <Icon className="h-5 w-5" /> : null}
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">{byType[type] || 0}</p>
                  <p className="text-sm text-slate-400">{label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="flex items-center gap-3 text-white mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Entity graph</h2>
            <p className="text-sm text-slate-400">Entities and their relationships.</p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading graph...</p>
          ) : entities.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <Layers className="mx-auto mb-4 h-10 w-10 text-primary-300" />
              <p>No entities in the graph yet. Entities are created as agents interact with contacts and data.</p>
            </div>
          ) : (
            entities.map((entity) => {
              const Icon = entityTypeIcons[entity.entity_type] || Layers;
              const outgoingRelations = relations.filter(r => r.from_entity_id === entity.id);
              const incomingRelations = relations.filter(r => r.to_entity_id === entity.id);

              return (
                <div key={entity.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-primary-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{entity.name}</h3>
                        <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs uppercase tracking-wider text-slate-400">
                          {entityTypeLabels[entity.entity_type] || entity.entity_type}
                        </span>
                      </div>
                      {entity.description && (
                        <p className="mt-1 text-sm text-slate-400">{entity.description}</p>
                      )}
                      {(outgoingRelations.length > 0 || incomingRelations.length > 0) && (
                        <div className="mt-3 space-y-2">
                          {outgoingRelations.map((rel) => {
                            const target = entityMap.get(rel.to_entity_id);
                            return target ? (
                              <div key={rel.id} className="flex items-center gap-2 text-sm">
                                <ArrowRight className="h-3 w-3 text-slate-500" />
                                <span className="text-slate-400">{rel.relation_type}</span>
                                <span className="text-white">{target.name}</span>
                              </div>
                            ) : null;
                          })}
                          {incomingRelations.map((rel) => {
                            const source = entityMap.get(rel.from_entity_id);
                            return source ? (
                              <div key={rel.id} className="flex items-center gap-2 text-sm">
                                <ArrowRight className="h-3 w-3 text-slate-500 rotate-180" />
                                <span className="text-slate-400">{rel.relation_type}</span>
                                <span className="text-white">{source.name}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}