"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Phone,
  User,
  Loader2,
  AlertCircle,
  MessageSquare,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface NewMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
  whatsappConnected: boolean;
}

interface ContactOption {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

export function NewMessageDialog({
  open,
  onOpenChange,
  onConversationCreated,
  whatsappConnected,
}: NewMessageDialogProps) {
  const supabase = createClient();

  // Tab state: 'contacts' or 'phone'
  const [tab, setTab] = useState<"contacts" | "phone">("contacts");

  // Contact search
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(
    null
  );

  // Phone input
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Submission state
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTab("contacts");
      setSearch("");
      setContacts([]);
      setSelectedContact(null);
      setPhoneNumber("");
      setPhoneError(null);
      setError(null);
    }
  }, [open]);

  // Search contacts when search term changes
  useEffect(() => {
    if (!open || tab !== "contacts") return;

    const searchContacts = async () => {
      setLoadingContacts(true);
      try {
        const term = search.trim();
        let query = supabase
          .from("contacts")
          .select("id, name, phone, email, company")
          .order("name", { ascending: true })
          .limit(50);

        if (term) {
          const searchTerm = `%${term}%`;
          query = query.or(
            `name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`
          );
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error searching contacts:", error);
          return;
        }

        setContacts(
          (data ?? []).map((c) => ({
            id: c.id,
            name: c.name || c.phone,
            phone: c.phone,
            email: c.email ?? undefined,
            company: c.company ?? undefined,
          }))
        );
      } finally {
        setLoadingContacts(false);
      }
    };

    const debounce = setTimeout(searchContacts, 300);
    return () => clearTimeout(debounce);
  }, [open, search, tab, supabase]);

  // Validate phone number
  const validatePhone = useCallback((phone: string): string | null => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-\(\)\+\.]/g, "");
    // Check for valid E.164 format or reasonable length
    if (cleaned.length < 8) {
      return "Please enter a valid phone number";
    }
    if (!/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
      return "Invalid phone number format";
    }
    return null;
  }, []);

  // Handle create conversation
  const handleCreateConversation = async () => {
    // Validate
    if (tab === "contacts") {
      if (!selectedContact) {
        setError("Please select a contact");
        return;
      }
    } else {
      const validationError = validatePhone(phoneNumber);
      if (validationError) {
        setPhoneError(validationError);
        return;
      }
    }

    if (!whatsappConnected) {
      setError("WhatsApp is not connected. Please configure WhatsApp in Settings first.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // Get current user and account
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.account_id) {
        throw new Error("No account found");
      }

      let contactId: string;
      let phoneToUse: string;

      if (tab === "contacts" && selectedContact) {
        contactId = selectedContact.id;
        phoneToUse = selectedContact.phone;
      } else {
        // Create or find contact by phone
        const cleanedPhone = phoneNumber.replace(/[\s\-\(\)\+\.]/g, "");
        // Ensure E.164 format
        phoneToUse = cleanedPhone.startsWith("+") ? cleanedPhone : `+${cleanedPhone}`;

        // Check if contact exists
        const { data: existingContact } = await supabase
          .from("contacts")
          .select("id, phone")
          .eq("account_id", profile.account_id)
          .or(`phone.eq.${phoneToUse},phone_normalized.eq.${phoneToUse.replace(/^\+/, '')}}`)
          .maybeSingle();

        if (existingContact) {
          contactId = existingContact.id;
        } else {
          // Create new contact
          const { data: newContact, error: createError } = await supabase
            .from("contacts")
            .insert({
              account_id: profile.account_id,
              user_id: user.id,
              phone: phoneToUse,
              name: phoneToUse, // Default name to phone if no name provided
            })
            .select("id")
            .single();

          if (createError) {
            console.error("Error creating contact:", createError);
            throw new Error("Failed to create contact");
          }

          contactId = newContact.id;
        }
      }

      // Check if conversation already exists with this contact
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("account_id", profile.account_id)
        .eq("contact_id", contactId)
        .eq("status", "open")
        .maybeSingle();

      if (existingConv) {
        // Use existing conversation
        toast.info("Opening existing conversation with this contact");
        onConversationCreated(existingConv.id);
        onOpenChange(false);
        return;
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          account_id: profile.account_id,
          user_id: user.id,
          contact_id: contactId,
          status: "open",
        })
        .select("id")
        .single();

      if (convError) {
        console.error("Error creating conversation:", convError);
        throw new Error("Failed to create conversation");
      }

      toast.success("Conversation started");
      onConversationCreated(conversation.id);
      onOpenChange(false);
    } catch (err) {
      console.error("Error in handleCreateConversation:", err);
      setError(err instanceof Error ? err.message : "Failed to start conversation");
    } finally {
      setCreating(false);
    }
  };

  // Filter contacts for display
  const filteredContacts = useMemo(() => {
    return contacts;
  }, [contacts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            New WhatsApp Message
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Start a new conversation with a contact or enter a phone number directly.
          </DialogDescription>
        </DialogHeader>

        {!whatsappConnected && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-400">
              WhatsApp is not connected. Please configure WhatsApp in Settings to send messages.
            </p>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
          <Button
            variant={tab === "contacts" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab("contacts")}
            className={`flex-1 ${
              tab === "contacts"
                ? "bg-primary text-primary-foreground"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="h-4 w-4 mr-2" />
            Select Contact
          </Button>
          <Button
            variant={tab === "phone" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab("phone")}
            className={`flex-1 ${
              tab === "phone"
                ? "bg-primary text-primary-foreground"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Phone className="h-4 w-4 mr-2" />
            Enter Phone
          </Button>
        </div>

        {/* Contact Search Tab */}
        {tab === "contacts" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedContact(null);
                }}
                className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Selected contact display */}
            {selectedContact && (
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {selectedContact.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedContact.phone}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedContact(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Contact list */}
            {!selectedContact && (
              <div className="max-h-[250px] overflow-y-auto space-y-1">
                {loadingContacts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-8 w-8 text-slate-600 mb-2" />
                    <p className="text-sm text-slate-500">
                      {search ? "No contacts found" : "No contacts yet"}
                    </p>
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-left transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono truncate">
                          {contact.phone}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Phone Input Tab */}
        {tab === "phone" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setPhoneError(null);
                  }}
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              {phoneError && (
                <p className="text-sm text-red-400">{phoneError}</p>
              )}
              <p className="text-xs text-slate-500">
                Enter phone number in international format (e.g., +1234567890)
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateConversation}
            disabled={creating || (tab === "contacts" && !selectedContact) || (tab === "phone" && !phoneNumber.trim())}
            className="bg-primary hover:bg-primary/90"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Conversation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}