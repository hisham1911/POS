import { Contrast01, Crop01, FlipBackward, FlipForward, RefreshCcw01, RefreshCw01, Sun, ZoomIn } from "@untitledui/icons";
import type Cropper from "cropperjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Cropper as ReactCropper, type ReactCropperElement } from "react-cropper";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitleText
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SliderRow } from "@/components/settings/slider-row";

export interface EditedImageResult {
  blob: Blob;
  dataUrl: string;
  file: File;
}

interface AspectOption {
  id: string;
  labelKey: string;
  value: number;
}

const aspectOptions: AspectOption[] = [
  { id: "free", labelKey: "editor.aspectFree", value: NaN },
  { id: "square", labelKey: "editor.aspectSquare", value: 1 },
  { id: "widescreen", labelKey: "editor.aspectWide", value: 16 / 9 },
  { id: "classic", labelKey: "editor.aspectClassic", value: 4 / 3 }
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const ImageEditorModal = ({
  open,
  file,
  title,
  description,
  onCancel,
  onSave
}: {
  open: boolean;
  file: File | null;
  title: string;
  description?: string;
  onCancel: () => void;
  onSave: (result: EditedImageResult) => void;
}) => {
  const { t } = useTranslation();
  const cropperRef = useRef<ReactCropperElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewTimer = useRef<number | null>(null);
  const [source, setSource] = useState<string>("");
  const [aspectMode, setAspectMode] = useState<string>("free");
  const [originalAspect, setOriginalAspect] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [flipX, setFlipX] = useState(1);
  const [flipY, setFlipY] = useState(1);
  const [isCropperReady, setIsCropperReady] = useState(false);

  useEffect(() => {
    if (!file) {
      setSource("");
      setIsCropperReady(false);
      return;
    }

    const nextSource = URL.createObjectURL(file);
    setSource(nextSource);
    setIsCropperReady(false);

    return () => {
      URL.revokeObjectURL(nextSource);
    };
  }, [file]);

  const getCropper = () => cropperRef.current?.cropper;

  const currentAspect = useMemo(() => {
    if (aspectMode === "original" && originalAspect) return originalAspect;
    return aspectOptions.find((option) => option.id === aspectMode)?.value ?? NaN;
  }, [aspectMode, originalAspect]);

  const applyTransforms = (instance = getCropper()) => {
    if (!instance || !isCropperReady) return;
    try {
      instance.rotateTo(rotation);
      instance.scaleX(flipX);
      instance.scaleY(flipY);
      instance.zoomTo(zoom);
      instance.setAspectRatio(currentAspect);
    } catch {
      // Ignore transient cropper state while the canvas is still settling.
    }
  };

  const paintPreview = (instance = getCropper()) => {
    if (!instance || !previewCanvasRef.current || !isCropperReady) return;
    let cropped: HTMLCanvasElement | null = null;

    try {
      cropped = instance.getCroppedCanvas({
        fillColor: "#ffffff"
      });
    } catch {
      return;
    }

    if (!cropped) return;

    const previewCanvas = previewCanvasRef.current;
    const context = previewCanvas.getContext("2d");
    if (!context) return;

    previewCanvas.width = Math.max(cropped.width, 1);
    previewCanvas.height = Math.max(cropped.height, 1);
    context.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    context.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    context.drawImage(cropped, 0, 0, previewCanvas.width, previewCanvas.height);
  };

  const schedulePreview = () => {
    if (!isCropperReady) return;
    if (previewTimer.current) {
      window.clearTimeout(previewTimer.current);
    }

    previewTimer.current = window.setTimeout(() => {
      paintPreview();
    }, 80);
  };

  useEffect(() => {
    if (!open || !source) {
      setIsCropperReady(false);
    }
  }, [open, source]);

  useEffect(() => {
    if (!open || !isCropperReady) return;
    applyTransforms();
    schedulePreview();
  }, [open, zoom, rotation, brightness, contrast, flipX, flipY, currentAspect, isCropperReady]);

  useEffect(
    () => () => {
      if (previewTimer.current) {
        window.clearTimeout(previewTimer.current);
      }
    },
    []
  );

  const handleCropperInitialized = (instance: Cropper) => {
    const data = instance.getImageData();
    if (data.naturalWidth && data.naturalHeight) {
      setOriginalAspect(data.naturalWidth / data.naturalHeight);
    }
  };

  const handleCropperReady = () => {
    const instance = getCropper();
    if (!instance) return;
    setIsCropperReady(true);
    requestAnimationFrame(() => {
      applyTransforms(instance);
      paintPreview(instance);
    });
  };

  const handleReset = () => {
    const cropper = getCropper();
    if (!cropper || !isCropperReady) return;
    cropper.reset();
    setAspectMode("free");
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setFlipX(1);
    setFlipY(1);
    schedulePreview();
  };

  const handleSave = () => {
    const cropper = getCropper();
    if (!cropper || !file) return;

    let croppedCanvas: HTMLCanvasElement | null = null;
    try {
      croppedCanvas = cropper.getCroppedCanvas({
        fillColor: "#ffffff"
      });
    } catch {
      toast.error(t("common.unexpectedError"));
      return;
    }

    if (!croppedCanvas) return;

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = croppedCanvas.width;
    finalCanvas.height = croppedCanvas.height;

    const context = finalCanvas.getContext("2d");
    if (!context) return;

    context.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    context.drawImage(croppedCanvas, 0, 0, croppedCanvas.width, croppedCanvas.height);

    finalCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const nextFile = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".png", {
          type: "image/png"
        });

        onSave({
          blob,
          dataUrl: finalCanvas.toDataURL("image/png"),
          file: nextFile
        });
      },
      "image/png",
      0.92
    );
  };

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogContent onClose={onCancel} size="xl" className="max-h-[88vh]">
        <DialogHeader>
          <DialogTitleText>{title}</DialogTitleText>
          <DialogDescription>
            {description || t("editor.description")}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5 overflow-y-auto">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div className="surface-outline h-[18rem] overflow-hidden rounded-[calc(var(--radius)+0.15rem)] bg-slate-950/80 sm:h-[22rem]">
                {source ? (
                  <ReactCropper
                    key={source}
                    src={source}
                    ref={cropperRef}
                    style={{ height: "100%", width: "100%", filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                    dragMode="move"
                    guides
                    background={false}
                    viewMode={1}
                    autoCropArea={0.92}
                    responsive
                    checkOrientation={false}
                    onInitialized={handleCropperInitialized}
                    crop={() => schedulePreview()}
                    cropend={() => schedulePreview()}
                    zoom={() => schedulePreview()}
                    ready={handleCropperReady}
                  />
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                {aspectOptions
                  .concat(originalAspect ? [{ id: "original", labelKey: "editor.aspectOriginal", value: originalAspect }] : [])
                  .map((option) => (
                    <Button
                      key={option.id}
                      variant={aspectMode === option.id ? "primary" : "outline"}
                      size="sm"
                      className="justify-center"
                      onClick={() => {
                        setAspectMode(option.id);
                        requestAnimationFrame(() => {
                          const cropper = getCropper();
                          if (!cropper || !isCropperReady) return;
                          cropper.setAspectRatio(option.value);
                          schedulePreview();
                        });
                      }}
                    >
                      {t(option.labelKey)}
                    </Button>
                  ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCcw01 className="size-4" />}
                  onClick={() => setRotation((current) => clamp(current - 90, -180, 180))}
                >
                  {t("editor.rotateLeft")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw01 className="size-4" />}
                  onClick={() => setRotation((current) => clamp(current + 90, -180, 180))}
                >
                  {t("editor.rotateRight")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FlipForward className="size-4" />}
                  onClick={() => setFlipX((current) => current * -1)}
                >
                  {t("editor.flipHorizontal")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FlipBackward className="size-4" />}
                  onClick={() => setFlipY((current) => current * -1)}
                >
                  {t("editor.flipVertical")}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="surface-outline rounded-[calc(var(--radius)+0.15rem)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Crop01 className="size-4 text-primary" />
                  <p className="font-semibold text-foreground">{t("common.preview")}</p>
                </div>
                <div className="mesh-preview flex min-h-[10rem] items-center justify-center bg-background/60 p-3 sm:min-h-[12rem]">
                  <canvas
                    ref={previewCanvasRef}
                    className="max-h-64 w-full rounded-[1.25rem] object-contain"
                  />
                </div>
              </div>

              <div className="surface-outline rounded-[calc(var(--radius)+0.15rem)] p-4">
                <div className="space-y-4">
                  <SliderRow
                    icon={<ZoomIn className="size-4 text-primary" />}
                    label={t("editor.zoom")}
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.05}
                    displayValue={`${Math.round(zoom * 100)}%`}
                    onChange={setZoom}
                  />
                  <SliderRow
                    icon={<RefreshCw01 className="size-4 text-primary" />}
                    label={t("editor.rotation")}
                    value={rotation}
                    min={-180}
                    max={180}
                    step={1}
                    displayValue={`${rotation} deg`}
                    onChange={setRotation}
                  />
                  <SliderRow
                    icon={<Sun className="size-4 text-primary" />}
                    label={t("editor.brightness")}
                    value={brightness}
                    min={50}
                    max={150}
                    step={1}
                    displayValue={`${brightness}%`}
                    onChange={setBrightness}
                  />
                  <SliderRow
                    icon={<Contrast01 className="size-4 text-primary" />}
                    label={t("editor.contrast")}
                    value={contrast}
                    min={50}
                    max={150}
                    step={1}
                    displayValue={`${contrast}%`}
                    onChange={setContrast}
                  />
                </div>
              </div>

              <div className="surface-outline rounded-[calc(var(--radius)+0.15rem)] p-4">
                <Label>{t("editor.tipTitle")}</Label>
                <p className="mt-1 text-sm text-muted-foreground">{t("editor.tipBody")}</p>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="sticky bottom-0 justify-between bg-card/95 backdrop-blur">
          <Button variant="ghost" onClick={handleReset}>
            {t("common.reset")}
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={!isCropperReady || !source}>
              {t("editor.saveImage")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
