import React, { useState, useEffect, useRef } from 'react';
import { createAvatar } from '@dicebear/core';
import * as avataaars from '@dicebear/avataaars';
import * as bottts from '@dicebear/bottts';
import * as identicon from '@dicebear/identicon';
import * as pixelArt from '@dicebear/pixel-art';
import * as initials from '@dicebear/initials';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

const styles = [
    { label: 'Avataaars', value: 'avataaars', collection: avataaars },
    { label: 'Robots (Bottts)', value: 'bottts', collection: bottts },
    { label: 'Geometric (Identicon)', value: 'identicon', collection: identicon },
    { label: '8-bit (Pixel Art)', value: 'pixel-art', collection: pixelArt },
    { label: 'Initials', value: 'initials', collection: initials }
];

const eyesOptions = [
    'closed', 'cry', 'default', 'eyeRoll', 'happy', 'hearts', 'side',
    'squint', 'surprised', 'winkWacky', 'wink', 'xDizzy'
];

const mouthOptions = [
    'concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad',
    'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'
];

const hairOptions = [
    'hat', 'hijab', 'turban', 'winterHat1', 'winterHat02', 'winterHat03', 'winterHat04',
    'bob', 'bun', 'curly', 'curvy', 'dreads', 'frida', 'fro', 'froBand',
    'longButNotTooLong', 'miaWallace', 'shavedSides', 'straight02', 'straight01',
    'straightAndStrand', 'dreads01', 'dreads02', 'frizzle', 'shaggy', 'shaggyMullet',
    'shortCurly', 'shortFlat', 'shortRound', 'shortWaved', 'sides', 'theCaesar',
    'theCaesarAndSidePart', 'bigHair'
];

const clothingOptions = [
    'blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt',
    'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'
];

const skinColorOptions = [
    { label: 'Light', value: 'ffdbb4' },
    { label: 'Pale', value: 'f5d0b0' },
    { label: 'Medium', value: 'edb98a' },
    { label: 'Tan', value: 'd08b5b' },
    { label: 'Dark', value: '614335' }
];

const hairColorOptions = [
    { label: 'Black', value: '2c1b18' },
    { label: 'Brown', value: '5a3a22' },
    { label: 'Blonde', value: 'f5d25c' },
    { label: 'Red', value: 'c93305' },
    { label: 'Gray', value: '929598' }
];

const clothesColorOptions = [
    { label: 'White', value: 'ffffff' },
    { label: 'Blue', value: '65c9ff' },
    { label: 'Navy', value: '25557c' },
    { label: 'Red', value: 'ff5c5c' },
    { label: 'Black', value: '262e33' },
    { label: 'Yellow', value: 'ffffb1' }
];

const bgColors = [
    { label: 'Sky Blue', value: '65c9ff' },
    { label: 'Light Gray', value: 'e6e7e8' },
    { label: 'Dark', value: '111111' },
    { label: 'White', value: 'ffffff' },
    { label: 'Orange', value: 'ff6600' }
];

const defaultOptions = {
    style: 'avataaars',
    seed: 'seed',
    eyes: 'happy',
    mouth: 'smile',
    top: 'longHair',
    clothing: 'hoodie',
    skinColor: 'ffdbb4',
    hairColor: '2c2c2c',
    clothesColor: 'ffffff',
    bgColor: '65c9ff'
};

const AvatarBuilder = ({ onSave, initialConfig = null }) => {
    const [options, setOptions] = useState({ ...defaultOptions, ...initialConfig });
    const [avatarUrl, setAvatarUrl] = useState('');
    const [flip, setFlip] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const previewImageRef = useRef(null);

    const updateOption = (key, value) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    // Generate avatar data URL on options change
    useEffect(() => {
        try {
            const selectedStyle = styles.find(s => s.value === options.style);
            const avatar = createAvatar(selectedStyle.collection, {
                size: 280,
                seed: options.seed,
                ...(options.style === 'avataaars' ? {
                    eyes: [options.eyes],
                    mouth: [options.mouth],
                    top: [options.top],
                    clothing: [options.clothing],
                    skinColor: [options.skinColor],
                    hairColor: [options.hairColor],
                    clothesColor: [options.clothesColor],
                    backgroundColor: [options.bgColor]
                } : {})
            });
            const svgString = avatar.toString();
            const dataUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString);
            setAvatarUrl(dataUrl);
        } catch (e) {
            console.error('Avatar generation error:', e);
            setAvatarUrl('data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><circle cx="100" cy="100" r="100" fill="#0066FF"/></svg>'));
        }
    }, [options]);

    const randomize = () => {
        const randomString = Math.random().toString(36).substring(7);
        updateOption('seed', randomString);
    };

    const handleSpin = () => {
        setSpinning(true);
        setTimeout(() => setSpinning(false), 800);
    };

    const handleSave = () => {
        onSave(avatarUrl);
    };

    return (
        <div className="avatar-builder p-4">
            <div className="preview flex flex-column align-items-center mb-4" style={{ marginTop: '2rem' }}>
                <div
                    className="avatar-preview-container p-3 mb-3"
                    style={{
                        background: 'var(--color-bg-elevated)',
                        borderRadius: '50%',
                        border: '4px solid var(--color-primary-light)',
                        boxShadow: 'var(--shadow-lg)',
                        transform: `scaleX(${flip ? -1 : 1}) rotateY(${spinning ? '360deg' : '0deg'})`,
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        width: '220px',
                        height: '220px',
                        overflow: 'hidden',
                        perspective: '1000px'
                    }}
                >
                    {avatarUrl && (
                        <img
                            ref={previewImageRef}
                            src={avatarUrl}
                            alt="Avatar preview"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'block' }}
                        />
                    )}
                </div>
                <div className="flex gap-2 mt-2">
                    <Button
                        label="Shuffle / Randomize"
                        icon="pi pi-shuffle"
                        className="p-button-rounded p-button-outlined font-bold"
                        onClick={randomize}
                    />
                    <Button
                        label="Flip Avatar"
                        icon="pi pi-refresh"
                        className="p-button-rounded p-button-outlined"
                        onClick={() => setFlip(prev => !prev)}
                    />
                    <Button
                        label="Spin"
                        icon="pi pi-sync"
                        className="p-button-rounded p-button-secondary"
                        onClick={handleSpin}
                        disabled={spinning}
                    />
                </div>
            </div>

            <div className="controls grid mt-2">
                <div className="col-12 md:col-6 mb-3">
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Avatar Style</label>
                    <Dropdown
                        value={options.style}
                        options={styles}
                        onChange={(e) => updateOption('style', e.value)}
                        className="w-full border-round-xl"
                        placeholder="Select style"
                        panelClassName="custom-dropdown-panel"
                    />
                </div>

                {options.style === 'avataaars' && (
                    <>
                        <div className="col-12 md:col-6 mb-3">
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Eyes</label>
                            <Dropdown
                                value={options.eyes}
                                options={eyesOptions.map(v => ({ label: v, value: v }))}
                                onChange={(e) => updateOption('eyes', e.value)}
                                className="w-full border-round-xl"
                                placeholder="Select eyes"
                                panelClassName="custom-dropdown-panel"
                            />
                        </div>
                        <div className="col-12 md:col-6 mb-3">
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Mouth</label>
                            <Dropdown
                                value={options.mouth}
                                options={mouthOptions.map(v => ({ label: v, value: v }))}
                                onChange={(e) => updateOption('mouth', e.value)}
                                className="w-full border-round-xl"
                                placeholder="Select mouth"
                                panelClassName="custom-dropdown-panel"
                            />
                        </div>
                        <div className="col-12 md:col-6 mb-3">
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Hairstyle</label>
                            <Dropdown
                                value={options.top}
                                options={hairOptions.map(v => ({ label: v.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()), value: v }))}
                                onChange={(e) => updateOption('top', e.value)}
                                className="w-full border-round-xl"
                                placeholder="Select hairstyle"
                                panelClassName="custom-dropdown-panel"
                            />
                        </div>
                        <div className="col-12 md:col-6 mb-3">
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Clothing</label>
                            <Dropdown
                                value={options.clothing}
                                options={clothingOptions.map(v => ({ label: v, value: v }))}
                                onChange={(e) => updateOption('clothing', e.value)}
                                className="w-full border-round-xl"
                                placeholder="Select clothing"
                                panelClassName="custom-dropdown-panel"
                            />
                        </div>
                        <div className="col-12 md:col-6 mb-3">
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Skin Color</label>
                            <Dropdown
                                value={options.skinColor}
                                options={skinColorOptions}
                                onChange={(e) => updateOption('skinColor', e.value)}
                                className="w-full border-round-xl"
                                placeholder="Select skin color"
                                panelClassName="custom-dropdown-panel"
                            />
                        </div>
                        <div className="col-12 md:col-6 mb-3">
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Hair Color</label>
                            <Dropdown
                                value={options.hairColor}
                                options={hairColorOptions}
                                onChange={(e) => updateOption('hairColor', e.value)}
                                className="w-full border-round-xl"
                                placeholder="Select hair color"
                                panelClassName="custom-dropdown-panel"
                            />
                        </div>
                        <div className="col-12 md:col-6 mb-3">
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Clothes Color</label>
                            <Dropdown
                                value={options.clothesColor}
                                options={clothesColorOptions}
                                onChange={(e) => updateOption('clothesColor', e.value)}
                                className="w-full border-round-xl"
                                placeholder="Select clothes color"
                                panelClassName="custom-dropdown-panel"
                            />
                        </div>
                        <div className="col-12 md:col-6 mb-3">
                            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Background Color</label>
                            <Dropdown
                                value={options.bgColor}
                                options={bgColors}
                                onChange={(e) => updateOption('bgColor', e.value)}
                                className="w-full border-round-xl"
                                placeholder="Select background"
                                panelClassName="custom-dropdown-panel"
                            />
                        </div>
                    </>
                )}
                <div className="col-12 mt-4 flex gap-3 justify-content-end">
                    <Button label="Apply Avatar" icon="pi pi-check" className="p-button-primary border-round-xl px-4" onClick={handleSave} />
                </div>
            </div>
        </div>
    );
};

export default AvatarBuilder;
