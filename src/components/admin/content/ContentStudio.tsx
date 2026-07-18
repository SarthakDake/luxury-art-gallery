"use client";

import { useEffect, useState } from "react";
import { ArtworksTab } from "./ArtworksTab";
import { ConfigTab } from "./ConfigTab";
import { ProfileTab } from "./ProfileTab";
import { StudioSitePreview } from "./StudioSitePreview";
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
    description: "Update branding, theme tokens, homepage sections, offers, and feature flags.",
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
  const [mirrorStatus, setMirrorStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!message || message.tone !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  useEffect(() => {
    async function loadMirrorStatus() {
      try {
        const response = await fetch("/api/admin/content/sync-status");
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          mirrors?: {
            blob: boolean;
            github: { enabled: boolean; configured: boolean; repo: string | null; branch: string | null };
          };
        };

        const parts: string[] = [];
        if (payload.mirrors?.blob) {
          parts.push("Blob JSON backup");
        }
        if (payload.mirrors?.github.configured) {
          parts.push(`GitHub ${payload.mirrors.github.repo}@${payload.mirrors.github.branch}`);
        } else if (payload.mirrors?.github.enabled) {
          parts.push("GitHub sync enabled but not fully configured");
        }

        setMirrorStatus(parts.length > 0 ? parts.join(" · ") : null);
      } catch {
        setMirrorStatus(null);
      }
    }

    void loadMirrorStatus();
  }, []);

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
          mirrorWarning?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not save artworks.");
        }

        setArtworks(payload.artworks ?? artworks);
        setMessage({
          tone: payload.mirrorWarning ? "error" : "success",
          text: payload.mirrorWarning
            ? `Artworks saved to the database, but remote sync needs attention: ${payload.mirrorWarning}`
            : "Artwork saved and it's live.",
        });
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
          mirrorWarning?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not save site settings.");
        }

        setConfig(payload.config ?? config);
        setMessage({
          tone: payload.mirrorWarning ? "error" : "success",
          text: payload.mirrorWarning
            ? `Site settings saved to the database, but remote sync needs attention: ${payload.mirrorWarning}`
            : "Site settings saved.",
        });
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
          mirrorWarning?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not save artist profile.");
        }

        setProfile(payload.profile ?? profile);
        setMessage({
          tone: payload.mirrorWarning ? "error" : "success",
          text: payload.mirrorWarning
            ? `Artist profile saved to the database, but remote sync needs attention: ${payload.mirrorWarning}`
            : "Artist profile saved.",
        });
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
      <div className="studio-layout">
        <StudioSitePreview
          config={config}
          artworks={artworks}
          profile={profile}
          activeTab={activeTab}
        />

        <div className="studio-main">
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
                {mirrorStatus ? ` Remote backup: ${mirrorStatus}.` : ""}
              </p>
            </div>
            <div className="studio-save-actions">
              {message?.tone === "success" ? (
                <p className="studio-save-feedback" role="status">
                  {message.text}
                </p>
              ) : null}
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
        </div>
      </div>
    </div>
  );
}
