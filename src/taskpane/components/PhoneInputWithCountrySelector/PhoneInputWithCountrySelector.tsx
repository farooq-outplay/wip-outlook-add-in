import React, { useEffect, useRef, useCallback } from "react";
import intlTelInput from "intl-tel-input";
import type { Iso2 } from "intl-tel-input/data";
import "intl-tel-input/build/css/intlTelInput.css";
import "./PhoneInputWithCountrySelector.css";

interface PhoneInputWithCountrySelectorProps {
    value: string;                       // full international phone e.g. "+14435551234"
    onSave: (fullPhone: string) => void; // called with full E.164 number
    onCancel?: () => void;
}

/**
 * Resolves the default country ISO2 from a phone string.
 * If the phone starts with "+", we let intl-tel-input detect the country.
 * Otherwise, falls back to "us".
 */
function getDefaultSelectedCountry(phone: string): Iso2 {
    if (phone && phone.startsWith("+")) {
        // Let intl-tel-input auto-detect from the number
        return "" as Iso2;
    }
    return getDefaultCountryFromUserConfig();
}

/**
 * Returns the fallback default country code.
 * Can be extended later to read from user profile/org config.
 */
function getDefaultCountryFromUserConfig(): Iso2 {
    return "us";
}

const PhoneInputWithCountrySelector: React.FC<PhoneInputWithCountrySelectorProps> = ({
    value,
    onSave,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const itiRef = useRef<ReturnType<typeof intlTelInput> | null>(null);

    // Initialize intl-tel-input on mount
    useEffect(() => {
        if (!inputRef.current) return;

        const defaultCountry = getDefaultSelectedCountry(value);

        const iti = intlTelInput(inputRef.current, {
            initialCountry: defaultCountry || "us",
            separateDialCode: true,
            countrySearch: true,
            showFlags: true,
            formatAsYouType: false,
            allowDropdown: true,
            nationalMode: false,
            autoPlaceholder: "off",
        });

        itiRef.current = iti;

        // If we have a saved value, set it so the library auto-detects the country
        if (value) {
            iti.setNumber(value);
        }

        return () => {
            iti.destroy();
            itiRef.current = null;
        };
    }, []); // only on mount

    // Restrict input to digits only
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
        if (allowed.includes(e.key)) return;
        if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) return;
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    }, []);

    // Strip non-numeric on paste
    const handleInput = useCallback(() => {
        if (!inputRef.current || !itiRef.current) return;
        const raw = inputRef.current.value;
        // Keep only digits (the library may add dial code/spaces, but in separateDialCode mode the input is local number only)
        const cleaned = raw.replace(/[^\d]/g, "");
        if (cleaned !== raw) {
            inputRef.current.value = cleaned;
        }
    }, []);

    const handleSave = useCallback(() => {
        if (!itiRef.current || !inputRef.current) {
            onSave("");
            return;
        }

        const localNumber = inputRef.current.value.replace(/\D/g, "");
        if (!localNumber) {
            onSave("");
            return;
        }

        // Get the selected country's dial code
        const countryData = (itiRef.current as any).getSelectedCountryData();
        const dialCode = countryData?.dialCode || "1";
        const fullPhone = `+${dialCode}${localNumber}`;
        onSave(fullPhone);
    }, [onSave]);

    return (
        <div className="phone-selector-container">
            <div className="phone-iti-wrapper">
                <input
                    ref={inputRef}
                    type="tel"
                    className="phone-number-input"
                    placeholder="No Phone"
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                />
            </div>
            {/* Save button */}
            <button
                type="button"
                className="phone-save-button"
                onClick={handleSave}
                aria-label="Save phone number"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5 5.5L8 14L3.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
};

export default PhoneInputWithCountrySelector;
