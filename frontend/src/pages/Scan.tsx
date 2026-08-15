import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Upload, Sparkles, Loader2, RotateCw, Columns2 } from "lucide-react";
import GarmentIcon from "../components/GarmentIcon";
import Pill from "../components/Pill";
import Button from "../components/Button";
import { getRecommendations } from "../api/recommendations";
import { addToCollection } from "../api/collections";
import { AIRecommendation, BodyMeasurements, MeasurementUnit, StyleProfile } from "../types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage } from "../api/client";
import { useMotionPreference } from "../hooks/useMotionPreference";
import type { AvatarOutfit } from "../components/Avatar3D";

const Avatar3D = lazy(() => import("../components/Avatar3D"));

const VIBES = ["Minimal", "Tailored", "Romantic", "Street", "Classic", "Indian Festive"];
const COLOR_OPTS = ["Bone", "Ink", "Brass", "Violet", "Maroon", "Gold", "Emerald", "Ivory", "Blush", "Sage"];
const OCCASIONS = ["Everyday", "Office", "Evening", "Festive"];
const PROFILE_KEY = "lookglass_style_profile";
const MEASUREMENTS_KEY = "lookglass_measurements";

const EMPTY_MEASUREMENTS: BodyMeasurements = { unit: "cm", heightCm: null, chestCm: null, waistCm: null, hipCm: null, shoulderCm: null };

function cmToDisplay(cm: number | null, unit: MeasurementUnit): string {
  if (cm == null) return "";
  return unit === "cm" ? String(Math.round(cm)) : (cm / 2.54).toFixed(1);
}
function displayToCm(value: string, unit: MeasurementUnit): number | null {
  const n = parseFloat(value);
  if (Number.isNaN(n) || n <= 0) return null;
  return unit === "cm" ? n : n * 2.54;
}

function resizeImageToBase64(file: File, maxDim = 800): Promise<{ dataUrl: string; base64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = (height * maxDim) / width; width = maxDim; }
        else if (height > maxDim) { width = (width * maxDim) / height; height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve({ dataUrl, base64: dataUrl.split(",")[1] });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MEASUREMENT_FIELDS: { key: keyof BodyMeasurements; label: string }[] = [
  { key: "heightCm", label: "Height" },
  { key: "chestCm", label: "Chest / bust" },
  { key: "waistCm", label: "Waist" },
  { key: "hipCm", label: "Hip" },
  { key: "shoulderCm", label: "Shoulder" },
];

export default function Scan() {
  const [profile, setProfile] = useState<StyleProfile>({ vibes: [], colors: [], occasions: [] });
  const [measurements, setMeasurements] = useState<BodyMeasurements>(EMPTY_MEASUREMENTS);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [recs, setRecs] = useState<AIRecommendation[]>([]);
  const [savedIdx, setSavedIdx] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIdx, setCompareIdx] = useState(1);
  const [autoRotate, setAutoRotate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { notify } = useToast();
  const { allowRich } = useMotionPreference();

  useEffect(() => {
    const storedProfile = localStorage.getItem(PROFILE_KEY);
    if (storedProfile) setProfile(JSON.parse(storedProfile));
    const storedMeasurements = localStorage.getItem(MEASUREMENTS_KEY);
    if (storedMeasurements) setMeasurements(JSON.parse(storedMeasurements));
  }, []);
  useEffect(() => { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(measurements)); }, [measurements]);

  const toggle = (list: string[], val: string) => (list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);

  function setUnit(unit: MeasurementUnit) {
    setMeasurements((m) => ({ ...m, unit }));
  }

  function setField(key: keyof BodyMeasurements, raw: string) {
    if (key === "unit") return;
    setMeasurements((m) => ({ ...m, [key]: displayToCm(raw, m.unit) }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, base64 } = await resizeImageToBase64(file);
      setPreview(dataUrl);
      setBase64(base64);
      setStatus("idle");
      setRecs([]);
      setSavedIdx([]);
    } catch {
      setErrorMsg("Couldn't read that image — try a JPG or PNG.");
      setStatus("error");
    }
  }

  async function runScan() {
    if (!base64) return;
    setStatus("scanning");
    setErrorMsg("");
    try {
      const { items } = await getRecommendations(base64, "image/jpeg", profile, measurements);
      setRecs(items);
      setAvatarIdx(0);
      setCompareIdx(items.length > 1 ? 1 : 0);
      setStatus("done");
    } catch (err) {
      setErrorMsg(extractErrorMessage(err, "The Glass couldn't focus on that one — try a clearer, front-facing photo."));
      setStatus("error");
    }
  }

  async function saveRec(r: AIRecommendation, idx: number) {
    if (!user) return notify("Sign in to save pieces to your wardrobe.", "error");
    await addToCollection("wardrobe", { name: r.title, category: r.category, price: null, colorway: "AI Edit", occasion: "AI Pick", source: "ai" });
    setSavedIdx((s) => [...s, idx]);
    notify(`Saved "${r.title}" to your wardrobe.`);
  }

  const hasMeasurements = MEASUREMENT_FIELDS.some((f) => measurements[f.key] != null);
  const avatarOutfit: AvatarOutfit | null = useMemo(
    () => (recs[avatarIdx] ? { category: recs[avatarIdx].category, colorPalette: recs[avatarIdx].colorPalette } : null),
    [recs, avatarIdx]
  );
  const compareOutfit: AvatarOutfit | null = useMemo(
    () => (recs[compareIdx] ? { category: recs[compareIdx].category, colorPalette: recs[compareIdx].colorPalette } : null),
    [recs, compareIdx]
  );

  return (
    <div className="py-10">
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">The Glass</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-2 text-ink">Show it your face, get back a wardrobe.</h1>
      <p className="mt-3 text-[#4A4638] text-[15px] max-w-lg">
        Upload a clear, front-facing photo, add your measurements if you'd like a sized preview, and the Glass hands back four outfits worth building on.
      </p>

      <div className="mt-8 grid md:grid-cols-[380px_1fr] gap-8">
        <div>
          <div
            className="relative aspect-[4/5] border border-line/70 bg-panel flex items-center justify-center overflow-hidden cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Your upload" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted group-hover:text-ink transition-colors">
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">Upload a photo</span>
                <span className="font-mono text-[10px] tracking-wider uppercase">JPG or PNG</span>
              </div>
            )}
            {status === "scanning" && (
              <div className="absolute inset-0 bg-ink/10">
                <div className="absolute left-0 right-0 h-[2px] bg-violet shadow-[0_0_12px_2px_rgba(76,59,115,0.6)] animate-scanline" />
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>
          {preview && (
            <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs font-medium text-ink underline underline-offset-4 decoration-line hover:decoration-ink">
              Choose a different photo
            </button>
          )}

          <div className="mt-7 space-y-5">
            <div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">Vibe</div>
              <div className="flex flex-wrap gap-2">
                {VIBES.map((v) => (
                  <Pill key={v} active={profile.vibes.includes(v)} onClick={() => setProfile((p) => ({ ...p, vibes: toggle(p.vibes, v) }))}>{v}</Pill>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">Colorway</div>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTS.map((c) => (
                  <Pill key={c} active={profile.colors.includes(c)} onClick={() => setProfile((p) => ({ ...p, colors: toggle(p.colors, c) }))}>{c}</Pill>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-2">Occasion</div>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <Pill key={o} active={profile.occasions.includes(o)} onClick={() => setProfile((p) => ({ ...p, occasions: toggle(p.occasions, o) }))}>{o}</Pill>
                ))}
              </div>
            </div>
          </div>

          {/* MEASUREMENTS — optional, drives the 3D avatar's proportions */}
          <div className="mt-7 border-t border-line/50 pt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-[10px] tracking-widest uppercase text-muted">Measurements (optional)</div>
              <div className="flex gap-1">
                <Pill active={measurements.unit === "cm"} onClick={() => setUnit("cm")}>cm</Pill>
                <Pill active={measurements.unit === "in"} onClick={() => setUnit("in")}>in</Pill>
              </div>
            </div>
            <p className="text-xs text-muted mb-3">Used only to size your 3D preview and for fit notes — never shared or shown to anyone else.</p>
            <div className="grid grid-cols-2 gap-3">
              {MEASUREMENT_FIELDS.map((f) => (
                <label key={f.key} className="flex flex-col gap-1">
                  <span className="text-xs text-muted">{f.label}</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={cmToDisplay(measurements[f.key] as number | null, measurements.unit)}
                    onChange={(e) => setField(f.key, e.target.value)}
                    placeholder={measurements.unit}
                    className="px-2.5 py-2 bg-panel border border-line/60 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet"
                  />
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={runScan}
            disabled={!base64 || status === "scanning"}
            className="mt-7 w-full inline-flex items-center justify-center gap-2 bg-ink text-canvas px-5 py-3 text-sm font-medium tracking-wide hover:bg-violet disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {status === "scanning" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {status === "scanning" ? "Reading the room…" : "Reveal my edit"}
          </button>
          {status === "error" && <p className="mt-3 text-sm text-[#8B3A3A]">{errorMsg}</p>}
        </div>

        <div>
          {status !== "done" && !recs.length && (
            <div className="h-full min-h-[280px] border border-dashed border-line flex items-center justify-center text-center p-8">
              <p className="text-sm text-muted max-w-xs">Your four-piece edit will appear here once the Glass has had a look — upload a photo and tap "Reveal my edit."</p>
            </div>
          )}
          {recs.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {recs.map((r, i) => (
                <div key={i} className="border border-line/60 bg-panel p-4 flex flex-col gap-3 animate-riseIn">
                  <div className="flex items-center justify-between">
                    <GarmentIcon category={r.category} className="w-10 h-10 text-violet" />
                    <div className="flex gap-1">
                      {(r.colorPalette || []).slice(0, 3).map((hex, hi) => (
                        <span key={hi} className="w-4 h-4 rounded-full border border-line/60" style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                  </div>
                  <h3 className="font-serif text-lg text-ink leading-snug">{r.title}</h3>
                  <p className="text-sm text-[#4A4638] leading-relaxed">{r.description}</p>
                  <p className="font-mono text-[11px] text-muted">{r.styleNote}</p>
                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() => saveRec(r, i)}
                      className={`flex-1 text-xs font-medium py-2 border transition-colors ${
                        savedIdx.includes(i) ? "bg-ink text-canvas border-ink" : "border-ink text-ink hover:bg-ink hover:text-canvas"
                      }`}
                    >
                      {savedIdx.includes(i) ? "Saved to wardrobe" : "Save to wardrobe"}
                    </button>
                    <button
                      onClick={() => { setAvatarIdx(i); setCompareMode(false); }}
                      className={`text-xs font-medium py-2 px-2.5 border transition-colors ${
                        !compareMode && avatarIdx === i ? "bg-violet text-canvas border-violet" : "border-line text-ink hover:border-ink"
                      }`}
                      title="View on 3D avatar"
                    >
                      View in 3D
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3D AVATAR + COMPARE */}
          {recs.length > 0 && (
            <div className="mt-8 border-t border-line/50 pt-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                  <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-violet">3D preview</div>
                  <h2 className="font-serif text-xl text-ink mt-1">
                    {hasMeasurements ? "Sized to your measurements" : "Default proportions — add measurements for a sized fit"}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant={autoRotate ? "primary" : "secondary"} onClick={() => setAutoRotate((v) => !v)} className="!px-3 !py-2 text-xs">
                    <RotateCw className="w-3.5 h-3.5" /> {autoRotate ? "Auto-rotating" : "Auto-rotate"}
                  </Button>
                  <Button variant={compareMode ? "primary" : "secondary"} onClick={() => setCompareMode((v) => !v)} className="!px-3 !py-2 text-xs">
                    <Columns2 className="w-3.5 h-3.5" /> Compare
                  </Button>
                </div>
              </div>

              {!allowRich ? (
                <div className="border border-dashed border-line p-6 flex items-center gap-4">
                  <GarmentIcon category={recs[avatarIdx]?.category} className="w-16 h-16 text-violet flex-shrink-0" />
                  <p className="text-sm text-muted">
                    The interactive 3D avatar needs a larger screen (and full motion enabled) to run smoothly — you're seeing a lightweight preview of{" "}
                    <strong className="text-ink font-medium">{recs[avatarIdx]?.title}</strong> instead.
                  </p>
                </div>
              ) : compareMode ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[{ idx: avatarIdx, setIdx: setAvatarIdx, outfit: avatarOutfit }, { idx: compareIdx, setIdx: setCompareIdx, outfit: compareOutfit }].map((slot, si) => (
                    <div key={si}>
                      <div className="aspect-[4/5] border border-line/60 bg-panel">
                        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-xs text-muted">Loading 3D preview…</div>}>
                          <Avatar3D measurements={measurements} outfit={slot.outfit} autoRotate={autoRotate} />
                        </Suspense>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {recs.map((r, i) => (
                          <Pill key={i} active={slot.idx === i} onClick={() => slot.setIdx(i)}>{r.title.split(" ").slice(0, 2).join(" ")}</Pill>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="aspect-[4/5] max-w-md border border-line/60 bg-panel">
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-xs text-muted">Loading 3D preview…</div>}>
                      <Avatar3D measurements={measurements} outfit={avatarOutfit} autoRotate={autoRotate} />
                    </Suspense>
                  </div>
                  <p className="mt-2 font-mono text-[10px] tracking-widest uppercase text-muted">Drag to rotate · Scroll to zoom</p>
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-md">
                    {recs.map((r, i) => (
                      <Pill key={i} active={avatarIdx === i} onClick={() => setAvatarIdx(i)}>{r.title.split(" ").slice(0, 2).join(" ")}</Pill>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
