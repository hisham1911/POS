import { CameraPlus, Trash01, UploadCloud01 } from "@untitledui/icons";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ImageEditorModal, type EditedImageResult } from "@/components/app/image-editor-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const ImageUploadField = ({
  label,
  description,
  value,
  onChange,
  actionLabel,
  clearLabel,
  accept = "image/*"
}: {
  label: string;
  description?: string;
  value: string | null;
  onChange: (result: EditedImageResult | null) => void;
  actionLabel?: string;
  clearLabel?: string;
  accept?: string;
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  return (
    <>
      <div className="space-y-3">
        <div>
          <Label>{label}</Label>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <div className="upload-dropzone">
          {value ? (
            <img
              src={value}
              alt={label}
              className="max-h-48 w-full rounded-[calc(var(--radius)+0.1rem)] object-cover"
            />
          ) : (
            <>
              <span className="rounded-3xl bg-primary/10 p-4 text-primary">
                <UploadCloud01 className="size-6" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{actionLabel || t("common.upload")}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              leftIcon={<CameraPlus className="size-4" />}
              onClick={() => inputRef.current?.click()}
            >
              {actionLabel || t("common.upload")}
            </Button>
            {value ? (
              <Button
                variant="ghost"
                leftIcon={<Trash01 className="size-4" />}
                onClick={() => onChange(null)}
              >
                {clearLabel || t("common.remove")}
              </Button>
            ) : null}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setPendingFile(file);
            event.target.value = "";
          }}
        />
      </div>

      <ImageEditorModal
        open={Boolean(pendingFile)}
        file={pendingFile}
        title={label}
        description={description}
        onCancel={() => setPendingFile(null)}
        onSave={(result) => {
          onChange(result);
          setPendingFile(null);
        }}
      />
    </>
  );
};
