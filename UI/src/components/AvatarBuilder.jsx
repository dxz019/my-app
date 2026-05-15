import React, { useState, useEffect } from 'react';
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

const defaultOptions = {
    style: 'avataaars',
    seed: 'seed',
    eyes: 'happy',
    mouth: 'smile',
    skinColor: 'f5d0b0',
    hairColor: '2c2c2c',
    clothesColor: 'ffffff'
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
            const selectedStyle = styles.find(s => s.value === options.style);
            const avatar = createAvatar(selectedStyle.collection, {
                size: 280,
                seed: options.seed,
                ...(options.style === 'avataaars' ? {
                    eyes: options.eyes,
                    mouth: options.mouth,
                    skinColor: [options.skinColor],
                    hairColor: [options.hairColor],
                    clothingColor: [options.clothesColor]
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

    const handleSave = () => {
        onSave(avatarUrl);
    };

    return (
        <div className="avatar-builder p-4">
            <div className="preview flex flex-column align-items-center mb-4">
                <div 
                    className="avatar-preview-container p-3 mb-3" 
                    style={{ 
                        background: 'var(--color-bg-elevated)', 
                        borderRadius: '50%',
                        border: '4px solid var(--color-primary-light)',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                >
                    {avatarUrl && (
                        <img src={avatarUrl} alt="Avatar preview" style={{ width: 220, height: 220, borderRadius: '50%' }} />
                    )}
                </div>
                <Button 
                    label="Shuffle / Randomize" 
                    icon="pi pi-shuffle" 
                    className="p-button-rounded p-button-outlined font-bold" 
                    onClick={randomize} 
                />
            </div>

            <div className="controls grid mt-2">
                <div className="col-12 md:col-6 mb-3">
                    <label className="block text-sm font-bold text-500 mb-2">Avatar Style</label>
                    <Dropdown
                        value={options.style}
                        options={styles}
                        onChange={(e) => updateOption('style', e.value)}
                        className="w-full border-round-xl"
                        placeholder="Select style"
                    />
                </div>
                
                {options.style === 'avataaars' && (
                    <>
                        <div className="col-12 md:col-6 mb-3">
                            <label className="block text-sm font-bold text-500 mb-2">Eyes</label>
                            <Dropdown
                                value={options.eyes}
                                options={eyesOptions.map(v => ({ label: v, value: v }))}
                                onChange={(e) => updateOption('eyes', e.value)}
                                className="w-full border-round-xl"
                                placeholder="Select eyes"
                            />
                        </div>
                        <div className="col-12 md:col-6 mb-3">
                            <label className="block text-sm font-bold text-500 mb-2">Mouth</label>
                            <Dropdown
                                value={options.mouth}
                                options={mouthOptions.map(v => ({ label: v, value: v }))}
                                onChange={(e) => updateOption('mouth', e.value)}
                                className="w-full border-round-xl"
                                placeholder="Select mouth"
                            />
                        </div>
                    </>
                )}

                <div className="col-12 mt-4 flex gap-3 justify-content-end">
                    <Button label="Cancel" icon="pi pi-times" className="p-button-text p-button-secondary" onClick={() => onSave(null)} />
                    <Button label="Apply Avatar" icon="pi pi-check" className="p-button-primary border-round-xl px-4" onClick={handleSave} />
                </div>
            </div>
        </div>
    );
};

export default AvatarBuilder;
