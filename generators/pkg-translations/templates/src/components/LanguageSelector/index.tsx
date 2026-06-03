import { useTranslation } from "react-i18next";
import { FormControl, Select, MenuItem, Typography, Box } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { supportedLngs, type SupportedLocale } from "@/i18n";

const localeLabels: Record<SupportedLocale, string> = {
  it: "Italiano",
  en: "English",
};

const localeFlags: Record<SupportedLocale, string> = {
  it: "🇮🇹",
  en: "🇬🇧",
};

const FlagLabel = ({
  lng,
  variant = "body2",
}: {
  lng: SupportedLocale;
  variant?: "body2" | "body1";
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
    <Box
      component="span"
      sx={{
        fontSize: variant === "body2" ? "1rem" : "1.125rem",
        lineHeight: 1,
      }}
      aria-hidden
    >
      {localeFlags[lng]}
    </Box>
    <Typography variant={variant} sx={{ fontWeight: 500 }}>
      {localeLabels[lng]}
    </Typography>
  </Box>
);

type LanguageSelectorProps = {
  size?: "small" | "medium";
  variant?: "outlined" | "standard" | "filled";
  sx?: object;
};

export const LanguageSelector = ({
  size = "small",
  variant = "outlined",
  sx,
}: LanguageSelectorProps) => {
  const { i18n } = useTranslation();
  const value = i18n.language?.startsWith("en") ? "en" : "it";

  const handleChange = (e: SelectChangeEvent<string>) => {
    const lng = e.target.value as SupportedLocale;
    i18n.changeLanguage(lng);
    localStorage.setItem("app-locale", lng);
  };

  return (
    <FormControl size={size} variant={variant} sx={{ minWidth: 140, ...sx }}>
      <Select
        value={value}
        onChange={handleChange}
        renderValue={(v) => <FlagLabel lng={v as SupportedLocale} />}
        sx={{
          borderRadius: 1,
          backgroundColor: "grey.50",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "grey.200",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "grey.300",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              mt: 1.5,
              borderRadius: 1.5,
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.06)",
              "& .MuiMenuItem-root": {
                py: 1.25,
                px: 2,
              },
            },
          },
        }}
      >
        {supportedLngs.map((lng) => (
          <MenuItem key={lng} value={lng}>
            <FlagLabel lng={lng} variant="body1" />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

LanguageSelector.displayName = "LanguageSelector";
