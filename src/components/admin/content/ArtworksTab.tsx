"use client";

import {
  ArtworkEditorHero,
  ArtworkEditorStep,
  ArtworkSidebar,
  ArtworkStepNav,
  ArtworkStepPanel,
} from "./ArtworkEditorShell";
import {
  ImageUploadField,
  StudioEmptyState,
  StudioField,
  StudioFormGrid,
  StudioGroup,
  StudioInput,
  StudioRepeaterHeader,
  StudioRepeaterItem,
  StudioSelect,
  StudioShell,
  StudioStepFooter,
  StudioToggle,
} from "./shared";
import { RichTextEditor } from "./RichTextEditor";
import { nextArtworkId, slugify } from "@/lib/site-data/slug";
import { useState } from "react";
import {
  DEFAULT_SHOWCASE_ENQUIRE_LABEL,
  type Artwork,
  type ArtworkSize,
  type ArtworkVideo,
} from "@/types/artwork";

function createEmptyArtwork(existing: Artwork[]): Artwork {
  const id = nextArtworkId(existing);
  return {
    id,
    title: "",
    slug: "",
    imageUrl: "",
    galleryImages: [],
    category: "",
    subcategory: "",
    material: "",
    inStock: true,
    showcaseOnly: false,
    description: "",
    sizes: [{ size: "24x36 inches", price: 2500 }],
    defaultSelectedSizeIndex: 0,
    videos: [],
  };
}

function updateArtwork(
  artworks: Artwork[],
  index: number,
  patch: Partial<Artwork>,
): Artwork[] {
  return artworks.map((artwork, artworkIndex) =>
    artworkIndex === index ? { ...artwork, ...patch } : artwork,
  );
}

function getCategorySuggestions(artworks: Artwork[]): string[] {
  return [...new Set(artworks.map((item) => item.category.trim()).filter(Boolean))];
}

export function ArtworksTab({
  artworks,
  onChange,
}: {
  artworks: Artwork[];
  onChange: (artworks: Artwork[]) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editorStep, setEditorStep] = useState<ArtworkEditorStep>("details");

  const artworkIndex =
    artworks.length === 0 ? 0 : Math.min(selectedIndex, artworks.length - 1);

  const categorySuggestions = getCategorySuggestions(artworks);

  function selectArtwork(index: number) {
    setSelectedIndex(index);
    setEditorStep("details");
  }

  function addArtwork() {
    onChange([...artworks, createEmptyArtwork(artworks)]);
    setSelectedIndex(artworks.length);
    setEditorStep("details");
  }

  function removeArtwork(index: number) {
    onChange(artworks.filter((_, artworkIndex) => artworkIndex !== index));
  }

  function updateSize(
    artworkIndex: number,
    sizeIndex: number,
    patch: Partial<ArtworkSize>,
  ) {
    const artwork = artworks[artworkIndex];
    const sizes = artwork.sizes.map((entry, entryIndex) =>
      entryIndex === sizeIndex ? { ...entry, ...patch } : entry,
    );
    onChange(updateArtwork(artworks, artworkIndex, { sizes }));
  }

  function addSize(artworkIndex: number) {
    const artwork = artworks[artworkIndex];
    onChange(
      updateArtwork(artworks, artworkIndex, {
        sizes: [...artwork.sizes, { size: "", price: 0 }],
      }),
    );
  }

  function removeSize(artworkIndex: number, sizeIndex: number) {
    const artwork = artworks[artworkIndex];
    onChange(
      updateArtwork(artworks, artworkIndex, {
        sizes: artwork.sizes.filter((_, index) => index !== sizeIndex),
      }),
    );
  }

  function addGalleryImage(artworkIndex: number) {
    const artwork = artworks[artworkIndex];
    onChange(
      updateArtwork(artworks, artworkIndex, {
        galleryImages: [...(artwork.galleryImages ?? []), ""],
      }),
    );
  }

  function updateGalleryImage(artworkIndex: number, imageIndex: number, path: string) {
    const artwork = artworks[artworkIndex];
    const galleryImages = [...(artwork.galleryImages ?? [])];
    galleryImages[imageIndex] = path;
    onChange(updateArtwork(artworks, artworkIndex, { galleryImages }));
  }

  function removeGalleryImage(artworkIndex: number, imageIndex: number) {
    const artwork = artworks[artworkIndex];
    onChange(
      updateArtwork(artworks, artworkIndex, {
        galleryImages: (artwork.galleryImages ?? []).filter(
          (_, index) => index !== imageIndex,
        ),
      }),
    );
  }

  function addVideo(artworkIndex: number) {
    const artwork = artworks[artworkIndex];
    onChange(
      updateArtwork(artworks, artworkIndex, {
        videos: [...(artwork.videos ?? []), { url: "", type: "youtube", title: "" }],
      }),
    );
  }

  function updateVideo(
    artworkIndex: number,
    videoIndex: number,
    patch: Partial<ArtworkVideo>,
  ) {
    const artwork = artworks[artworkIndex];
    const videos = (artwork.videos ?? []).map((video, index) =>
      index === videoIndex ? { ...video, ...patch } : video,
    );
    onChange(updateArtwork(artworks, artworkIndex, { videos }));
  }

  function removeVideo(artworkIndex: number, videoIndex: number) {
    const artwork = artworks[artworkIndex];
    onChange(
      updateArtwork(artworks, artworkIndex, {
        videos: (artwork.videos ?? []).filter((_, index) => index !== videoIndex),
      }),
    );
  }

  if (artworks.length === 0) {
    return (
      <StudioShell>
        <StudioEmptyState
          title="Start your gallery"
          description="Add your first artwork in a few guided steps — name it, upload a photo, set a price, and save."
          actionLabel="Add first piece"
          onAction={addArtwork}
        />
      </StudioShell>
    );
  }

  const artwork = artworks[artworkIndex];
  const slug = artwork.slug || slugify(artwork.title) || artwork.id;

  return (
    <div className="studio-artworks-layout">
      <ArtworkSidebar
        artworks={artworks}
        selectedIndex={artworkIndex}
        onSelect={selectArtwork}
        onAdd={addArtwork}
      />

      <div className="studio-artworks-editor">
        <ArtworkEditorHero
          artwork={artwork}
          onDelete={() => removeArtwork(artworkIndex)}
        />

        <ArtworkStepNav activeStep={editorStep} onChange={setEditorStep} />

        <ArtworkStepPanel
          step="details"
          activeStep={editorStep}
          title="Artwork details"
          lead="Fill in the essentials first — name, category, and description."
        >
          <StudioGroup eyebrow="Step 1" title="Name" description="This is the title shoppers see in your gallery.">
            <StudioField label="Artwork title" fullWidth>
              <StudioInput
                value={artwork.title}
                onChange={(event) => {
                  const title = event.target.value;
                  onChange(
                    updateArtwork(artworks, artworkIndex, {
                      title,
                      slug: slugify(title),
                    }),
                  );
                }}
                placeholder="e.g. Horizon Line No. 7"
              />
            </StudioField>
          </StudioGroup>

          <StudioGroup
            eyebrow="Step 2"
            title="Classification"
            description="Group this piece so visitors can browse by type."
          >
            <StudioFormGrid>
              <StudioField label="Category">
                <StudioInput
                  value={artwork.category}
                  onChange={(event) =>
                    onChange(
                      updateArtwork(artworks, artworkIndex, {
                        category: event.target.value,
                      }),
                    )
                  }
                  placeholder="Ready to hang Arts"
                  list="studio-category-suggestions"
                />
              </StudioField>

              <StudioField label="Subcategory">
                <StudioInput
                  value={artwork.subcategory}
                  onChange={(event) =>
                    onChange(
                      updateArtwork(artworks, artworkIndex, {
                        subcategory: event.target.value,
                      }),
                    )
                  }
                  placeholder="Landscape"
                />
              </StudioField>

              <StudioField label="Material" fullWidth>
                <StudioInput
                  value={artwork.material}
                  onChange={(event) =>
                    onChange(
                      updateArtwork(artworks, artworkIndex, {
                        material: event.target.value,
                      }),
                    )
                  }
                  placeholder="Oil on linen"
                />
              </StudioField>
            </StudioFormGrid>

            <datalist id="studio-category-suggestions">
              {categorySuggestions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </StudioGroup>

          <StudioGroup
            eyebrow="Step 3"
            title="About this piece"
            description="Formatting is preserved on the product page. Use headings, bold, lists, and blank lines."
          >
            <StudioField label="Description" fullWidth>
              <RichTextEditor
                value={artwork.description}
                onChange={(description) =>
                  onChange(
                    updateArtwork(artworks, artworkIndex, {
                      description,
                    }),
                  )
                }
                placeholder={
                  "## About this piece\n\nDescribe the mood, medium, and story.\n\n- Handmade\n- Ready to hang"
                }
                rows={10}
              />
            </StudioField>
          </StudioGroup>

          <StudioGroup eyebrow="Step 4" title="Availability">
            <StudioToggle
              label="Showcase only (display piece, not for sale)"
              checked={Boolean(artwork.showcaseOnly)}
              onChange={(checked) =>
                onChange(
                  updateArtwork(artworks, artworkIndex, {
                    showcaseOnly: checked,
                    ...(checked && !artwork.showcaseEnquireLabel
                      ? { showcaseEnquireLabel: DEFAULT_SHOWCASE_ENQUIRE_LABEL }
                      : {}),
                  }),
                )
              }
            />
            {artwork.showcaseOnly ? (
              <StudioField
                label="Enquiry button text"
                hint="Shown on the product page instead of Add to Cart. Opens WhatsApp with a link to this piece."
              >
                <StudioInput
                  value={artwork.showcaseEnquireLabel ?? ""}
                  onChange={(event) =>
                    onChange(
                      updateArtwork(artworks, artworkIndex, {
                        showcaseEnquireLabel: event.target.value,
                      }),
                    )
                  }
                  placeholder={DEFAULT_SHOWCASE_ENQUIRE_LABEL}
                />
              </StudioField>
            ) : null}
            <StudioToggle
              label="Available to purchase"
              checked={artwork.inStock}
              disabled={Boolean(artwork.showcaseOnly)}
              onChange={(checked) =>
                onChange(updateArtwork(artworks, artworkIndex, { inStock: checked }))
              }
            />
          </StudioGroup>

          <StudioStepFooter
            primary={{ label: "Continue to photos", onClick: () => setEditorStep("photos") }}
          />
        </ArtworkStepPanel>

        <ArtworkStepPanel
          step="photos"
          activeStep={editorStep}
          title="Photos"
          lead="Upload a cover image first, then add optional gallery shots."
        >
          <StudioGroup eyebrow="Cover" title="Main photo" description="Shown in the shop grid and product page hero.">
            <ImageUploadField
              label="Cover image"
              path={artwork.imageUrl}
              slug={slug}
              kind="cover"
              onUploaded={(path) =>
                onChange(updateArtwork(artworks, artworkIndex, { imageUrl: path }))
              }
            />
          </StudioGroup>

          <StudioGroup eyebrow="Gallery" title="Additional photos" description="Optional extra angles for the product carousel.">
            <StudioRepeaterHeader
              title="Uploaded photos"
              addLabel="Add photo"
              onAdd={() => addGalleryImage(artworkIndex)}
            />

            {(artwork.galleryImages ?? []).length === 0 ? (
              <p className="studio-field-hint studio-step-empty-hint">
                No extra photos yet. Tap “Add photo” when you are ready.
              </p>
            ) : null}

            <div className="studio-repeater-list">
              {(artwork.galleryImages ?? []).map((imagePath, imageIndex) => (
                <StudioRepeaterItem
                  key={`${artwork.id}-gallery-${imageIndex}`}
                  index={imageIndex}
                  title={`Photo ${imageIndex + 1}`}
                  removeLabel="Remove photo"
                  onRemove={() => removeGalleryImage(artworkIndex, imageIndex)}
                >
                  <ImageUploadField
                    label="Upload"
                    path={imagePath}
                    slug={slug}
                    kind="gallery"
                    galleryIndex={imageIndex}
                    compact
                    onUploaded={(path) =>
                      updateGalleryImage(artworkIndex, imageIndex, path)
                    }
                  />
                </StudioRepeaterItem>
              ))}
            </div>
          </StudioGroup>

          <StudioStepFooter
            back={{ label: "Back", onClick: () => setEditorStep("details") }}
            primary={{ label: "Continue to pricing", onClick: () => setEditorStep("pricing") }}
          />
        </ArtworkStepPanel>

        <ArtworkStepPanel
          step="pricing"
          activeStep={editorStep}
          title="Sizes & pricing"
          lead="List every size you sell. Shoppers choose one on the product page."
        >
          <StudioGroup eyebrow="Pricing" title="Size options">
            <StudioRepeaterHeader
              title="Your sizes"
              addLabel="Add size"
              onAdd={() => addSize(artworkIndex)}
            />

            <div className="studio-repeater-list">
              {artwork.sizes.map((size, sizeIndex) => (
                <StudioRepeaterItem
                  key={`${artwork.id}-size-${sizeIndex}`}
                  index={sizeIndex}
                  title={size.size || `Size ${sizeIndex + 1}`}
                  removeLabel="Remove size"
                  onRemove={() => removeSize(artworkIndex, sizeIndex)}
                >
                  <StudioFormGrid>
                    <StudioField label="Dimensions / label">
                      <StudioInput
                        value={size.size}
                        onChange={(event) =>
                          updateSize(artworkIndex, sizeIndex, {
                            size: event.target.value,
                          })
                        }
                        placeholder="24 × 36 inches"
                      />
                    </StudioField>
                    <StudioField label="Price in ₹">
                      <StudioInput
                        type="number"
                        min={0}
                        value={size.price}
                        onChange={(event) =>
                          updateSize(artworkIndex, sizeIndex, {
                            price: Number(event.target.value),
                          })
                        }
                      />
                    </StudioField>
                  </StudioFormGrid>
                </StudioRepeaterItem>
              ))}
            </div>
          </StudioGroup>

          <StudioStepFooter
            back={{ label: "Back", onClick: () => setEditorStep("photos") }}
            primary={{ label: "Continue to videos", onClick: () => setEditorStep("videos") }}
          />
        </ArtworkStepPanel>

        <ArtworkStepPanel
          step="videos"
          activeStep={editorStep}
          title="Videos"
          lead="Optional — add YouTube, Instagram, or a local video file."
        >
          <StudioGroup eyebrow="Media" title="Product videos">
            <StudioRepeaterHeader
              title="Video links"
              addLabel="Add video"
              onAdd={() => addVideo(artworkIndex)}
            />

            {(artwork.videos ?? []).length === 0 ? (
              <p className="studio-field-hint studio-step-empty-hint">
                No videos added. You can skip this step if not needed.
              </p>
            ) : null}

            <div className="studio-repeater-list">
              {(artwork.videos ?? []).map((video, videoIndex) => (
                <StudioRepeaterItem
                  key={`${artwork.id}-video-${videoIndex}`}
                  index={videoIndex}
                  title={video.title || `Video ${videoIndex + 1}`}
                  removeLabel="Remove video"
                  onRemove={() => removeVideo(artworkIndex, videoIndex)}
                >
                  <StudioFormGrid>
                    <StudioField label="Platform">
                      <StudioSelect
                        value={video.type ?? "youtube"}
                        onChange={(event) =>
                          updateVideo(artworkIndex, videoIndex, {
                            type: event.target.value as ArtworkVideo["type"],
                          })
                        }
                      >
                        <option value="youtube">YouTube</option>
                        <option value="instagram">Instagram</option>
                        <option value="file">Local video file</option>
                      </StudioSelect>
                    </StudioField>
                    <StudioField label="Link or file path" fullWidth>
                      <StudioInput
                        value={video.url}
                        onChange={(event) =>
                          updateVideo(artworkIndex, videoIndex, {
                            url: event.target.value,
                          })
                        }
                        placeholder="https://youtube.com/… or /videos/my-video.mp4"
                      />
                    </StudioField>
                    <StudioField label="Caption (optional)" fullWidth>
                      <StudioInput
                        value={video.title ?? ""}
                        onChange={(event) =>
                          updateVideo(artworkIndex, videoIndex, {
                            title: event.target.value,
                          })
                        }
                        placeholder="Studio process"
                      />
                    </StudioField>
                  </StudioFormGrid>
                  <ImageUploadField
                    label="Poster thumbnail (optional)"
                    path={video.poster}
                    slug={slug}
                    kind="video-poster"
                    videoIndex={videoIndex}
                    compact
                    onUploaded={(path) =>
                      updateVideo(artworkIndex, videoIndex, { poster: path })
                    }
                  />
                </StudioRepeaterItem>
              ))}
            </div>
          </StudioGroup>

          <StudioStepFooter
            back={{ label: "Back", onClick: () => setEditorStep("pricing") }}
            secondary={{ label: "Advanced options", onClick: () => setEditorStep("more") }}
            primary={{ label: "Done with videos", onClick: () => setEditorStep("more") }}
          />
        </ArtworkStepPanel>

        <ArtworkStepPanel
          step="more"
          activeStep={editorStep}
          title="Advanced options"
          lead="Only use these if you need something different from your site defaults."
        >
          <StudioGroup eyebrow="URL" title="Web address">
            <StudioField label="URL slug" hint="Used in the link for this artwork." fullWidth>
              <StudioInput
                value={artwork.slug}
                onChange={(event) =>
                  onChange(
                    updateArtwork(artworks, artworkIndex, {
                      slug: slugify(event.target.value),
                    }),
                  )
                }
              />
            </StudioField>
          </StudioGroup>

          <StudioGroup eyebrow="Product page" title="Default selections">
            <StudioField label="Pre-selected size" fullWidth>
              <StudioSelect
                value={String(artwork.defaultSelectedSizeIndex ?? 0)}
                onChange={(event) =>
                  onChange(
                    updateArtwork(artworks, artworkIndex, {
                      defaultSelectedSizeIndex: Number(event.target.value),
                    }),
                  )
                }
              >
                {artwork.sizes.map((size, index) => (
                  <option key={`${artwork.id}-default-size-${index}`} value={index}>
                    {size.size || `Size ${index + 1}`}
                  </option>
                ))}
              </StudioSelect>
            </StudioField>
          </StudioGroup>

          <StudioGroup
            eyebrow="Overrides"
            title="Custom product copy"
            description="Leave blank to use the defaults from Site Settings. Formatting matches the Product Details accordion."
          >
            <StudioField label="Dispatch note" fullWidth>
              <RichTextEditor
                value={artwork.dispatchNote ?? ""}
                onChange={(dispatchNote) =>
                  onChange(
                    updateArtwork(artworks, artworkIndex, {
                      dispatchNote,
                    }),
                  )
                }
                placeholder="Site default"
                rows={4}
                compact
                showHint={false}
              />
            </StudioField>
            <StudioField label="Care guide" fullWidth>
              <RichTextEditor
                value={artwork.careGuide ?? ""}
                onChange={(careGuide) =>
                  onChange(
                    updateArtwork(artworks, artworkIndex, {
                      careGuide,
                    }),
                  )
                }
                placeholder="Site default"
                rows={8}
                compact
              />
            </StudioField>
            <StudioField label="Shipping & returns" fullWidth>
              <RichTextEditor
                value={artwork.shippingReturns ?? ""}
                onChange={(shippingReturns) =>
                  onChange(
                    updateArtwork(artworks, artworkIndex, {
                      shippingReturns,
                    }),
                  )
                }
                placeholder="Site default"
                rows={8}
                compact
              />
            </StudioField>
            <StudioField label="Before you buy" fullWidth>
              <RichTextEditor
                value={artwork.beforeYouBuy ?? ""}
                onChange={(beforeYouBuy) =>
                  onChange(
                    updateArtwork(artworks, artworkIndex, {
                      beforeYouBuy,
                    }),
                  )
                }
                placeholder="Site default"
                rows={8}
                compact
              />
            </StudioField>
          </StudioGroup>

          <StudioStepFooter
            back={{ label: "Back to videos", onClick: () => setEditorStep("videos") }}
            primary={{ label: "Finish editing", onClick: () => setEditorStep("details") }}
          />
        </ArtworkStepPanel>
      </div>
    </div>
  );
}
