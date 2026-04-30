import React, { useState, useEffect } from 'react';
import { createAvatar } from '@dicebear/core';
import * as avataaars from '@dicebear/avataaars';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

const eyesOptions = [
    'closed', 'cry', 'default', 'eyeRoll', 'happy', 'hearts', 'side',
    'squint', 'surprised', 'winkWacky', 'wink', 'xDizzy'
];

const mouthOptions = [
    'concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad',
    'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'
];

const topOptions = [
    'hat', 'hijab', 'turban', 'winterHat1', 'winterHat02', 'winterHat03',
    'winterHat04', 'bob', 'bun', 'curly', 'curvy', 'dreads', 'frida', 'fro',
    'froBand', 'longButNotTooLong', 'miaWallace', 'shavedSides', 'straight02',
    'straight01', 'straightAndStrand', 'dreads01', 'dreads02', 'frizzle',
    'shaggy', 'shaggyMullet', 'shortCurly', 'shortFlat', 'shortRound',
    'shortWaved', 'sides', 'theCaesar', 'theCaesarAndSidePart', 'bigHair'
];

const clothingOptions = [
    'blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt',
    'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'
];

const eyebrowsOptions = [
    'angryNatural', 'defaultNatural', 'flatNatural', 'frownNatural',
    'raisedExcitedNatural', 'sadConcernedNatural', 'unibrowNatural', 'upDownNatural',
    'angry', 'default', 'raisedExcited', 'sadConcerned', 'upDown'
];

const facialHairOptions = [
    'beardLight', 'beardMajestic', 'beardMedium', 'moustacheFancy', 'moustacheMagnum'
];

const accessoriesOptions = [
    'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers', 'eyepatch'
];

const clothingGraphicOptions = [
    'bat', 'bear', 'cumbia', 'deer', 'diamond', 'hola', 'pizza', 'resist', 'skull', 'skullOutline'
];

const skinColorOptions = [
    { label: 'Light', value: 'f5d0b0' },
    { label: 'Fair', value: 'eac086' },
    { label: 'Medium', value: 'd08b5b' },
    { label: 'Olive', value: 'a56e42' },
    { label: 'Dark', value: '8b5a2b' },
    { label: 'Very Dark', value: '5c3d2e' },
];

const hairColorOptions = [
    { label: 'Black', value: '2c2c2c' },
    { label: 'Brown', value: '8b4513' },
    { label: 'Blonde', value: 'f5deb3' },
    { label: 'Red', value: 'b22222' },
    { label: 'Gray', value: '808080' },
    { label: 'White', value: 'ffffff' },
    { label: 'Blue', value: '1E90FF' },
    { label: 'Pink', value: 'FFC0CB' },
];

const clothesColorOptions = [
    { label: 'Black', value: '000000' },
    { label: 'White', value: 'ffffff' },
    { label: 'Blue', value: '0066FF' },
    { label: 'Gray', value: '808080' },
    { label: 'Navy', value: '000080' },
    { label: 'Red', value: 'FF0000' },
];

const accessoriesColorOptions = [
    { label: 'Black', value: '000000' },
    { label: 'Brown', value: '8B4513' },
    { label: 'Gold', value: 'FFD700' },
    { label: 'Silver', value: 'C0C0C0' },
];

const hatColorOptions = [
    { label: 'Black', value: '000000' },
    { label: 'White', value: 'ffffff' },
    { label: 'Red', value: 'FF0000' },
    { label: 'Blue', value: '0000FF' },
    { label: 'Green', value: '008000' },
];

const facialHairColorOptions = hairColorOptions; // same palette

const defaultOptions = {
    eyes: 'happy',
    mouth: 'smile',
    top: 'shortWaved',
    clothing: 'shirtCrewNeck',
    eyebrows: 'defaultNatural',
    facialHair: '',
    accessories: '',
    skinColor: 'f5d0b0',
    hairColor: '2c2c2c',
    clothesColor: 'ffffff',
    accessoriesColor: '000000',
    hatColor: '000000',
    facialHairColor: '2c2c2c',
    clothingGraphic: '',
};

const AvatarBuilder = ({ onSave, initialConfig = null }) => {
    const [options, setOptions] = useState({ ...defaultOptions });
    const [avatarUrl, setAvatarUrl] = useState('');

    const updateOption = (key, value) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    // Generate avatar data URL on options change
    useEffect(() => {
        try {
            const avatar = createAvatar(avataaars, {
                size: 280,
                eyes: options.eyes,
                mouth: options.mouth,
                top: options.top,
                clothing: options.clothing,
                eyebrows: options.eyebrows,
                facialHair: options.facialHair || undefined,
                accessories: options.accessories || undefined,
                skinColor: options.skinColor,
                hairColor: options.hairColor,
                clothesColor: options.clothesColor,
                accessoriesColor: options.accessoriesColor,
                hatColor: options.hatColor,
                facialHairColor: options.facialHairColor,
                clothingGraphic: options.clothingGraphic || undefined,
            });
            const svgString = avatar.toString();
            // Use URI-encoded data URL (more reliable than base64 for Unicode)
            const dataUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString);
            setAvatarUrl(dataUrl);
        } catch (e) {
            console.error('Avatar generation error:', e);
            // Fallback: generate a simple colored circle
            setAvatarUrl('data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><circle cx="100" cy="100" r="100" fill="#0066FF"/></svg>'));
        }
    }, [options]);

    // Initialize with provided config if any
    useEffect(() => {
        if (initialConfig) {
            setOptions(prev => ({ ...prev, ...initialConfig }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const randomize = () => {
        const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const randomColor = (arr) => arr[Math.floor(Math.random() * arr.length)].value;
        setOptions(prev => ({
            ...prev,
            eyes: random(eyesOptions),
            mouth: random(mouthOptions),
            top: random(topOptions),
            clothing: random(clothingOptions),
            eyebrows: random(eyebrowsOptions),
            facialHair: random(facialHairOptions),
            accessories: random(accessoriesOptions),
            skinColor: random(skinColorOptions).value,
            hairColor: random(hairColorOptions).value,
            clothesColor: random(clothesColorOptions).value,
            accessoriesColor: random(accessoriesColorOptions).value,
            hatColor: random(hatColorOptions).value,
            facialHairColor: random(facialHairColorOptions).value,
            clothingGraphic: random(clothingGraphicOptions),
        }));
    };

    const handleSave = () => {
        onSave(avatarUrl);
    };

    return (
        <div className="avatar-builder p-4">
            <div className="preview flex justify-content-center mb-4">
                {avatarUrl && (
                    <img src={avatarUrl} alt="Avatar preview" style={{ width: 200, height: 200 }} />
                )}
            </div>
            <div className="controls grid grid-cols-2 gap-3">
                <div className="field">
                    <label className="text-sm font-bold text-500">Eyes</label>
                    <Dropdown
                        value={options.eyes}
                        options={eyesOptions.map(v => ({ label: v, value: v }))}
                        onChange={(e) => updateOption('eyes', e.value)}
                        className="w-full"
                        placeholder="Select eyes"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Mouth</label>
                    <Dropdown
                        value={options.mouth}
                        options={mouthOptions.map(v => ({ label: v, value: v }))}
                        onChange={(e) => updateOption('mouth', e.value)}
                        className="w-full"
                        placeholder="Select mouth"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Hair Style</label>
                    <Dropdown
                        value={options.top}
                        options={topOptions.map(v => ({ label: v, value: v }))}
                        onChange={(e) => updateOption('top', e.value)}
                        className="w-full"
                        placeholder="Select hair"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Clothing</label>
                    <Dropdown
                        value={options.clothing}
                        options={clothingOptions.map(v => ({ label: v, value: v }))}
                        onChange={(e) => updateOption('clothing', e.value)}
                        className="w-full"
                        placeholder="Select clothing"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Eyebrows</label>
                    <Dropdown
                        value={options.eyebrows}
                        options={eyebrowsOptions.map(v => ({ label: v, value: v }))}
                        onChange={(e) => updateOption('eyebrows', e.value)}
                        className="w-full"
                        placeholder="Select eyebrows"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Facial Hair</label>
                    <Dropdown
                        value={options.facialHair}
                        options={[{ label: 'None', value: '' }, ...facialHairOptions.map(v => ({ label: v, value: v }))]}
                        onChange={(e) => updateOption('facialHair', e.value)}
                        className="w-full"
                        placeholder="None"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Accessories</label>
                    <Dropdown
                        value={options.accessories}
                        options={[{ label: 'None', value: '' }, ...accessoriesOptions.map(v => ({ label: v, value: v }))]}
                        onChange={(e) => updateOption('accessories', e.value)}
                        className="w-full"
                        placeholder="None"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Skin Tone</label>
                    <Dropdown
                        value={options.skinColor}
                        options={skinColorOptions}
                        onChange={(e) => updateOption('skinColor', e.value)}
                        className="w-full"
                        placeholder="Select skin tone"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Hair Color</label>
                    <Dropdown
                        value={options.hairColor}
                        options={hairColorOptions}
                        onChange={(e) => updateOption('hairColor', e.value)}
                        className="w-full"
                        placeholder="Select hair color"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Clothes Color</label>
                    <Dropdown
                        value={options.clothesColor}
                        options={clothesColorOptions}
                        onChange={(e) => updateOption('clothesColor', e.value)}
                        className="w-full"
                        placeholder="Select clothes color"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Accessories Color</label>
                    <Dropdown
                        value={options.accessoriesColor}
                        options={accessoriesColorOptions}
                        onChange={(e) => updateOption('accessoriesColor', e.value)}
                        className="w-full"
                        placeholder="Select"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Hat Color</label>
                    <Dropdown
                        value={options.hatColor}
                        options={hatColorOptions}
                        onChange={(e) => updateOption('hatColor', e.value)}
                        className="w-full"
                        placeholder="Select"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Facial Hair Color</label>
                    <Dropdown
                        value={options.facialHairColor}
                        options={facialHairColorOptions}
                        onChange={(e) => updateOption('facialHairColor', e.value)}
                        className="w-full"
                        placeholder="Select"
                    />
                </div>
                <div className="field">
                    <label className="text-sm font-bold text-500">Clothing Graphic</label>
                    <Dropdown
                        value={options.clothingGraphic}
                        options={[{ label: 'None', value: '' }, ...clothingGraphicOptions.map(v => ({ label: v, value: v }))]}
                        onChange={(e) => updateOption('clothingGraphic', e.value)}
                        className="w-full"
                        placeholder="None"
                    />
                </div>
            </div>

            <div className="actions flex gap-3 justify-content-end mt-4">
                <Button label="Randomize" icon="pi pi-shuffle" className="p-button-outlined" onClick={randomize} />
                <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => onSave(null)} />
                <Button label="Save Avatar" icon="pi pi-check" onClick={handleSave} />
            </div>
        </div>
    );
};

export default AvatarBuilder;
