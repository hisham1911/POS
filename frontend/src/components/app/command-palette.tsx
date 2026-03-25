import { HomeSmile, SearchLg } from "@untitledui/icons";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { navSections } from "@/components/layout/navigation";

export const CommandPalette = ({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const items = useMemo(
    () =>
      navSections.flatMap((section) =>
        section.items.map((item) => ({
          ...item,
          label: t(`nav.${item.key}`)
        }))
      ),
    [t]
  );

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent onClose={onClose} size="sm" className="p-0">
        <Command>
          <div className="flex items-center gap-3 border-b border-border/70 px-4">
            <SearchLg className="size-4 text-muted-foreground" />
            <CommandInput
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("layout.searchModules")}
            />
          </div>
          <CommandList>
            {filtered.length ? (
              <CommandGroup>
                {filtered.map((item) => {
                  const Icon = item.icon ?? HomeSmile;

                  return (
                    <CommandItem
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                    >
                      <span className="rounded-2xl bg-primary/12 p-2 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span>{item.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : (
              <CommandEmpty>{t("common.comingSoon")}</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
