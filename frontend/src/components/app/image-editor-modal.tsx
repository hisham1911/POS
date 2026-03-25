import { Contrast01, Crop01, FlipBackward, FlipForward, RefreshCcw01, RefreshCw01, Sun, ZoomIn } from "@untitledui/icons";
import type Cropper from "cropperjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Cropper as ReactCropper, type ReactCropperElement } from "react-cropper";
import { useTranslation } from "react-i18next";

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

  useEffect(() => {
    if (!file) {
      setSource("");
      return;
    }

    const nextSource = URL.createObjectURL(file);
    setSource(nextSource);

    return () => {
      URL.revokeObjectURL(nextSource);
    };
  }, [file]);

  const cropper = cropperRef.current?.cropper;

  const currentAspect = useMemo(() => {
    if (aspectMode === "original" && originalAspect) return originalAspect;
    return aspectOptions.find((option) => option.id === aspectMode)?.value ?? NaN;
  }, [aspectMode, originalAspect]);

  const applyTransforms = () => {
    if (!cropper) return;
    cropper.rotateTo(rotation);
    cropper.scaleX(flipX);
    cropper.scaleY(flipY);
    cropper.zoomTo(zoom);
    cropper.setAspectRatio(currentAspect);
  };

  const paintPreview = () => {
    if (!cropper || !previewCanvasRef.current) return;

    const cropped = cropper.getCroppedCanvas({
      fillColor: "#ffffff"
    });

    if (!cropped) return;

    const previewCanvas = previewCanvasRef.current;
    const context = previewCanvas.getContext("2d");
    if (!context) return;

    previewCanvas.width = cropped.width;
    previewCanvas.height = cropped.height;
    context.clearRect(0, 0, cropped.width, cropped.height);
    context.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    context.drawImage(cropped, 0, 0, cropped.width, cropped.height);
  };

  const schedulePreview = () => {
    if (previewTimer.current) {
      window.clearTimeout(previewTimer.current);
    }

    previewTimer.current = window.setTimeout(() => {
      paintPreview();
    }, 80);
  };

  useEffect(() => {
    if (!open) return;
    applyTransforms();
    schedulePreview();
  }, [open, zoom, rotation, brightness, contrast, flipX, flipY, currentAspect]);

  useEffect(
    () => () => {
      if (previewTimer.current) {
        window.clearTimeout(previewTimer.current);
      }
    },
    []
  );

  const handleReset = () => {
    if (!cropper) return;
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
    if (!cropper || !file) return;

    const croppedCanvas = cropper.getCroppedCanvas({
      fillColor: "#ffffff"
    });

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
      <DialogContent onClose={onCancel} size="full" className="max-h-[95vh]">
        <DialogHeader>
          <DialogTitleText>{title}</DialogTitleText>
          <DialogDescription>
            {description || t("editor.description")}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="surface-outline h-[26rem] overflow-hidden rounded-[calc(var(--radius)+0.15rem)] bg-slate-950/80">
                {source ? (
                  <ReactCropper
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
                    onInitialized={(instance: Cropper) => {
                      const data = instance.getImageData();
                      if (data.naturalWidth && data.naturalHeight) {
                        setOriginalAspect(data.naturalWidth / data.naturalHeight);
                      }
                      instance.setAspectRatio(currentAspect);
                      instance.zoomTo(zoom);
                      schedulePreview();
                    }}
                    crop={schedulePreview}
                    cropend={schedulePreview}
                    zoom={schedulePreview}
                    ready={schedulePreview}
                  />
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {aspectOptions
                  .concat(originalAspect ? [{ id: "original", labelKey: "editor.aspectOriginal", value: originalAspect }] : [])
                  .map((option) => (
                    <Button
                      key={option.id}
                      variant={aspectMode === option.id ? "primary" : "outline"}
                      className="justify-center"
                      onClick={() => {
                        setAspectMode(option.id);
                        requestAnimationFrame(() => {
                          cropper?.setAspectRatio(option.value);
                          schedulePreview();
                        });
                      }}
                    >
                      {t(option.labelKey)}
                    </Button>
                  ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  leftIcon={<RefreshCcw01 className="size-4" />}
                  onClick={() => setRotation((current) => clamp(current - 90, -180, 180))}
                >
                  {t("editor.rotateLeft")}
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<RefreshCw01 className="size-4" />}
                  onClick={() => setRotation((current) => clamp(current + 90, -180, 180))}
                >
                  {t("editor.rotateRight")}
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<FlipForward className="size-4" />}
                  onClick={() => setFlipX((current) => current * -1)}
                >
                  {t("editor.flipHorizontal")}
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<FlipBackward className="size-4" />}
                  onClick={() => setFlipY((current) => current * -1)}
                >
                  {t("editor.flipVertical")}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="surface-outline rounded-[calc(var(--radius)+0.15rem)] p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Crop01 className="size-4 text-primary" />
                  <p className="font-semibold text-foreground">{t("common.preview")}</p>
                </div>
                <div className="mesh-preview flex min-h-[14rem] items-center justify-center bg-background/60 p-4">
                  <canvas
                    ref={previewCanvasRef}
                    className="max-h-80 w-full rounded-[1.25rem] object-contain"
                  />
                </div>
              </div>

              <div className="surface-outline rounded-[calc(var(--radius)+0.15rem)] p-4">
                <div className="space-y-5">
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
                <p className="text-sm text-muted-foreground">{t("editor.tipBody")}</p>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="justify-between">
          <Button variant="ghost" onClick={handleReset}>
            {t("common.reset")}
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave}>{t("editor.saveImage")}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
