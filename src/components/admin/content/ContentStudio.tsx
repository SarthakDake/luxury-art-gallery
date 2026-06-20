"use client";

import { useEffect, useState } from "react";
import { ArtworksTab } from "./ArtworksTab";
import { ConfigTab } from "./ConfigTab";
import { ProfileTab } from "./ProfileTab";
import { StudioMessage, StudioTabs } from "./shared";
import type { ArtistProfile, SiteConfig } from "@/types/site-config";
import type { Artwork } from "@/types/artwork";

const TABS = [
  {
    id: "artworks",
    label: "Artworks",
    description: "Pick a piece, follow the steps, and save when you're done.",
  },
  {
    id: "config",
    label: "Site Settings",
    description: "Update branding, contact details, offers, and social links.",
  },
  {
    id: "profile",
    label: "Artist Profile",
    description: "Edit your biography, portrait, exhibitions, and press.",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ContentStudio() {
  const [activeTab, setActiveTab] = useState<TabId>("artworks");
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadContent() {
      setLoading(true);

      try {
        const [artworksRes, configRes, profileRes] = await Promise.all([
          fetch("/api/admin/content/artworks"),
          fetch("/api/admin/content/config"),
          fetch("/api/admin/content/profile"),
        ]);

        if (!artworksRes.ok || !configRes.ok || !profileRes.ok) {
          throw new Error("Could not load content.");
        }

        const artworksPayload = (await artworksRes.json()) as { artworks: Artwork[] };
        const configPayload = (await configRes.json()) as { config: SiteConfig };
        const profilePayload = (await profileRes.json()) as { profile: ArtistProfile };

        setArtworks(artworksPayload.artworks);
        setConfig(configPayload.config);
        setProfile(profilePayload.profile);
      } catch (error) {
        setMessage({
          tone: "error",
          text: error instanceof Error ? error.message : "Could not load content.",
        });
      } finally {
        setLoading(false);
      }
    }

    void loadContent();
  }, []);

  function handleTabChange(id: string) {
    setActiveTab(id as TabId);
    setMessage(null);
  }

  async function saveActiveTab() {
    setSaving(true);
    setMessage(null);

    try {
      if (activeTab === "artworks") {
        const response = await fetch("/api/admin/content/artworks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artworks }),
        });
        const payload = (await response.json()) as {
          artworks?: Artwork[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not save artworks.");
        }

        setArtworks(payload.artworks ?? artworks);
        setMessage({ tone: "success", text: "Artworks saved. Your gallery is live." });
      }

      if (activeTab === "config" && config) {
        const response = await fetch("/api/admin/content/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config }),
        });
        const payload = (await response.json()) as {
          config?: SiteConfig;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not save site settings.");
        }

        setConfig(payload.config ?? config);
        setMessage({ tone: "success", text: "Site settings saved." });
      }

      if (activeTab === "profile" && profile) {
        const response = await fetch("/api/admin/content/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile }),
        });
        const payload = (await response.json()) as {
          profile?: ArtistProfile;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not save artist profile.");
        }

        setProfile(payload.profile ?? profile);
        setMessage({ tone: "success", text: "Artist profile saved." });
      }
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Save failed.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="studio-loading" aria-live="polite">
        <div className="studio-loading-bar" />
        <p className="body-text">Preparing your content…</p>
      </div>
    );
  }

  if (!config || !profile) {
    return (
      <StudioMessage tone="error">
        Could not load site content. Confirm you are signed in as admin.
      </StudioMessage>
    );
  }

  const activeLabel = TABS.find((tab) => tab.id === activeTab)?.label ?? "Changes";

  return (
    <div className="content-studio">
      <div className="studio-workspace">
        <StudioTabs tabs={[...TABS]} active={activeTab} onChange={handleTabChange} />

        {message ? <StudioMessage tone={message.tone}>{message.text}</StudioMessage> : null}

        <div role="tabpanel" className="studio-tabpanel">
          {activeTab === "artworks" ? (
            <ArtworksTab artworks={artworks} onChange={setArtworks} />
          ) : null}
          {activeTab === "config" ? (
            <ConfigTab config={config} onChange={setConfig} />
          ) : null}
          {activeTab === "profile" ? (
            <ProfileTab profile={profile} onChange={setProfile} />
          ) : null}
        </div>
      </div>

      <div className="studio-save-bar">
        <div className="studio-save-copy">
          <p className="studio-save-title">Ready to publish?</p>
          <p className="studio-field-hint">
            Save this tab to update the live site. Images are renamed automatically.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary studio-save-btn"
          disabled={saving}
          onClick={() => void saveActiveTab()}
        >
          {saving ? "Saving…" : `Save ${activeLabel}`}
        </button>
      </div>
    </div>
  );
}
