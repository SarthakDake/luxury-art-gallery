"use client";

import {
  ImageUploadField,
  StudioField,
  StudioFormGrid,
  StudioGroup,
  StudioInput,
  StudioRepeaterHeader,
  StudioRepeaterItem,
  StudioSection,
  StudioShell,
} from "./shared";
import { RichTextEditor } from "./RichTextEditor";
import type { StudioPreviewTarget } from "./preview-targets";
import type { ArtistProfile } from "@/types/site-config";

export function ProfileTab({
  profile,
  onChange,
  onRequestPreview,
}: {
  profile: ArtistProfile;
  onChange: (profile: ArtistProfile) => void;
  onRequestPreview?: (target: StudioPreviewTarget) => void;
}) {
  function preview(
    region: Extract<StudioPreviewTarget, { scope: "about" }>["region"],
    label: string,
  ) {
    onRequestPreview?.({ scope: "about", region, label });
  }

  return (
    <StudioShell>
      <StudioSection
        title="Artist identity"
        subtitle="About page"
        onPreview={() => preview("identity", "About page — identity & portrait")}
      >
        <StudioGroup eyebrow="Profile" title="Name & tagline">
          <StudioFormGrid>
            <StudioField label="Artist name">
              <StudioInput
                value={profile.artistName}
                onChange={(event) => onChange({ ...profile, artistName: event.target.value })}
              />
            </StudioField>
            <StudioField label="Tagline">
              <StudioInput
                value={profile.artistTagline}
                onChange={(event) => onChange({ ...profile, artistTagline: event.target.value })}
              />
            </StudioField>
          </StudioFormGrid>
        </StudioGroup>

        <StudioGroup
          eyebrow="Story"
          title="Biography"
          description="Formatting is preserved on the About page. Use headings, bold, lists, and blank lines for spacing."
        >
          <StudioField label="About you" fullWidth>
            <RichTextEditor
              value={profile.biography}
              onChange={(biography) => onChange({ ...profile, biography })}
              placeholder={
                "## About the studio\n\nTell visitors about your practice.\n\n### Process\n\nUse **bold** for emphasis and blank lines between sections."
              }
            />
          </StudioField>
        </StudioGroup>

        <StudioGroup eyebrow="Photo" title="Portrait" description="Shown on the About page.">
          <ImageUploadField
            label="Portrait photo"
            path={profile.portraitImageUrl}
            slug="artist"
            kind="portrait"
            onUploaded={(path) => onChange({ ...profile, portraitImageUrl: path })}
          />
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Exhibitions"
        subtitle="Career"
        onPreview={() => preview("exhibitions", "About page — exhibitions")}
      >
        <StudioGroup eyebrow="Shows" title="Exhibition history">
          <StudioRepeaterHeader
            title="Past exhibitions"
            addLabel="Add exhibition"
            onAdd={() =>
              onChange({
                ...profile,
                exhibitions: [
                  ...profile.exhibitions,
                  { year: new Date().getFullYear(), title: "", location: "" },
                ],
              })
            }
          />

          {profile.exhibitions.length === 0 ? (
            <p className="studio-field-hint studio-step-empty-hint">
              Add past shows, collections, or launches.
            </p>
          ) : null}

          <div className="studio-repeater-list">
            {profile.exhibitions.map((exhibition, index) => (
              <StudioRepeaterItem
                key={`exhibition-${index}`}
                index={index}
                title={exhibition.title || `Exhibition ${index + 1}`}
                removeLabel="Remove exhibition"
                onRemove={() =>
                  onChange({
                    ...profile,
                    exhibitions: profile.exhibitions.filter((_, i) => i !== index),
                  })
                }
              >
                <StudioFormGrid>
                  <StudioField label="Year">
                    <StudioInput
                      type="number"
                      value={exhibition.year}
                      onChange={(event) =>
                        onChange({
                          ...profile,
                          exhibitions: profile.exhibitions.map((entry, i) =>
                            i === index ? { ...entry, year: Number(event.target.value) } : entry,
                          ),
                        })
                      }
                    />
                  </StudioField>
                  <StudioField label="Title">
                    <StudioInput
                      value={exhibition.title}
                      onChange={(event) =>
                        onChange({
                          ...profile,
                          exhibitions: profile.exhibitions.map((entry, i) =>
                            i === index ? { ...entry, title: event.target.value } : entry,
                          ),
                        })
                      }
                    />
                  </StudioField>
                  <StudioField label="Location" fullWidth>
                    <StudioInput
                      value={exhibition.location}
                      onChange={(event) =>
                        onChange({
                          ...profile,
                          exhibitions: profile.exhibitions.map((entry, i) =>
                            i === index ? { ...entry, location: event.target.value } : entry,
                          ),
                        })
                      }
                    />
                  </StudioField>
                </StudioFormGrid>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>
      </StudioSection>

      <StudioSection
        title="Press"
        subtitle="Media"
        defaultOpen={Boolean(profile.press.length)}
        onPreview={() => preview("press", "About page — press")}
      >
        <StudioGroup eyebrow="Media" title="Press features">
          <StudioRepeaterHeader
            title="Articles & mentions"
            addLabel="Add mention"
            onAdd={() =>
              onChange({
                ...profile,
                press: [
                  ...profile.press,
                  { publication: "", year: new Date().getFullYear(), link: "" },
                ],
              })
            }
          />

          {profile.press.length === 0 ? (
            <p className="studio-field-hint studio-step-empty-hint">
              Optional links to articles or features.
            </p>
          ) : null}

          <div className="studio-repeater-list">
            {profile.press.map((item, index) => (
              <StudioRepeaterItem
                key={`press-${index}`}
                index={index}
                title={item.publication || `Press ${index + 1}`}
                removeLabel="Remove press feature"
                onRemove={() =>
                  onChange({
                    ...profile,
                    press: profile.press.filter((_, i) => i !== index),
                  })
                }
              >
                <StudioFormGrid>
                  <StudioField label="Publication">
                    <StudioInput
                      value={item.publication}
                      onChange={(event) =>
                        onChange({
                          ...profile,
                          press: profile.press.map((entry, i) =>
                            i === index ? { ...entry, publication: event.target.value } : entry,
                          ),
                        })
                      }
                    />
                  </StudioField>
                  <StudioField label="Year">
                    <StudioInput
                      type="number"
                      value={item.year}
                      onChange={(event) =>
                        onChange({
                          ...profile,
                          press: profile.press.map((entry, i) =>
                            i === index ? { ...entry, year: Number(event.target.value) } : entry,
                          ),
                        })
                      }
                    />
                  </StudioField>
                  <StudioField label="Link" fullWidth>
                    <StudioInput
                      value={item.link}
                      onChange={(event) =>
                        onChange({
                          ...profile,
                          press: profile.press.map((entry, i) =>
                            i === index ? { ...entry, link: event.target.value } : entry,
                          ),
                        })
                      }
                      placeholder="https://…"
                    />
                  </StudioField>
                </StudioFormGrid>
              </StudioRepeaterItem>
            ))}
          </div>
        </StudioGroup>
      </StudioSection>
    </StudioShell>
  );
}
