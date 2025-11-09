"use client"
import React, { useState, useMemo } from 'react';
import { Search, Filter, Coins, ChevronDown, ChevronUp } from 'lucide-react';
import armourJson from '../data/armour.json';
import foodJson from '../data/food.json';
import weaponsJson from '../data/weapons.json';
import potionsJson from '../data/potions.json';


// TypeScript interfaces
interface ArmorItem {
    Name: string;
    Armor_Q1: number;
    Armor_Q4: number;
    InferredTier: number;
    PriceCoins_Q1: number;
    PriceCoins_Q2?: number;
    PriceCoins_Q3?: number;
    PriceCoins_Q4: number;
    Note?: string;
    category?: string;
}

interface FoodItem {
    Name: string;
    Health: number;
    Stamina: number;
    Eitr: number;
    TotalStats: number;
    BiomeProgression: number;
    PriceCoins: number;
    set: number;
    Note?: string;
    category?: string;
}

interface WeaponItem {
    Name: string;
    Damage?: Record<string, string>;
    StaminaPrimary?: number;
    StaminaSecondary?: number | null;
    Rarity: string;
    Price: number;
    Knockback?: number;
    Note?: string;
    category?: string;
}

interface PotionItem {
    Name: string;
    PriceCoins: number;
    set: number;
    Note?: string;
    category?: string;
}

type MarketItem = (ArmorItem | FoodItem | WeaponItem | PotionItem) & {
    category: string;
    Rarity?: string;
    InferredTier?: number;
    BiomeProgression?: number;
};

interface PriceRange {
    min: number;
    max: number;
}

const ValheimMarketplace: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedRarity, setSelectedRarity] = useState<string>('All');
    const [selectedTier, setSelectedTier] = useState<string | number>('All');
    const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1000000 });
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [sortBy, setSortBy] = useState<string>('name');

    // Mock data - replace with actual imports
    const armorData: ArmorItem[] = (armourJson as unknown) as ArmorItem[];
    const foodData: FoodItem[] = (foodJson as unknown) as FoodItem[];
    const weaponsData: WeaponItem[] = (weaponsJson as unknown) as WeaponItem[];
    const potionsData: PotionItem[] = (potionsJson as unknown) as PotionItem[];

    const allItems = useMemo<MarketItem[]>(() => {
        const items: MarketItem[] = [];

        armorData.forEach(item => items.push({ ...item, category: 'Armor' }));
        foodData.forEach(item => items.push({ ...item, category: 'Food' }));
        weaponsData.forEach(item => items.push({ ...item, category: 'Weapons' }));
        potionsData.forEach(item => items.push({ ...item, category: 'Potions' }));
        return items;
    }, []);

    const rarities = useMemo<string[]>(() => {
        const uniqueRarities = new Set(
            allItems
                .map(item => item.Rarity)
                .filter((r): r is string => typeof r === 'string' && r.length > 0)
        );
        return ['All', ...Array.from(uniqueRarities)];
    }, [allItems]);

    const tiers = useMemo<(string | number)[]>(() => {
        const uniqueTiers = new Set(
            allItems
                .map(item => item.InferredTier)
                .filter((tier): tier is number => typeof tier === 'number')
        );
        return ['All', ...Array.from(uniqueTiers).sort((a, b) => a - b)];
    }, [allItems]);

    const getItemPrice = (item: MarketItem): number => {
        if ('PriceCoins_Q1' in item) return item.PriceCoins_Q1;
        if ('PriceCoins' in item) return item.PriceCoins;
        if ('Price' in item) return item.Price;
        return 0;
    };

    const filteredItems = useMemo<MarketItem[]>(() => {
        let filtered = allItems.filter(item => {
            const matchesSearch = item.Name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const matchesRarity = selectedRarity === 'All' || item.Rarity === selectedRarity;
            const matchesTier = selectedTier === 'All' || item.InferredTier === selectedTier;

            const itemPrice = getItemPrice(item);
            const matchesPrice = itemPrice >= priceRange.min && itemPrice <= priceRange.max;

            return matchesSearch && matchesCategory && matchesRarity && matchesTier && matchesPrice;
        });

        if (sortBy === 'name') {
            filtered.sort((a, b) => a.Name.localeCompare(b.Name));
        } else if (sortBy === 'price-low') {
            filtered.sort((a, b) => getItemPrice(a) - getItemPrice(b));
        } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => getItemPrice(b) - getItemPrice(a));
        }

        return filtered;
    }, [allItems, searchTerm, selectedCategory, selectedRarity, selectedTier, priceRange, sortBy]);

    const toggleItemExpansion = (itemName: string): void => {
        setExpandedItems(prev => ({
            ...prev,
            [itemName]: !prev[itemName]
        }));
    };

    const getTierColor = (tier: number): string => {
        const colors: Record<number, string> = {
            1: 'bg-gray-600',
            2: 'bg-green-600',
            3: 'bg-blue-600',
            4: 'bg-purple-600',
            5: 'bg-orange-600',
            6: 'bg-red-600',
            7: 'bg-yellow-500'
        };
        return colors[tier] || 'bg-gray-500';
    };

    const getRarityColor = (rarity: string): string => {
        const colors: Record<string, string> = {
            'Common': 'text-gray-400',
            'Uncommon': 'text-green-400',
            'Rare': 'text-blue-400',
            'Very Rare': 'text-purple-400',
            'Legendary': 'text-orange-400',
            'Mythic': 'text-red-400'
        };
        return colors[rarity] || 'text-gray-400';
    };

    const renderItemCard = (item: MarketItem) => {
        const isExpanded = expandedItems[item.Name];
        const hasQualityPricing = 'PriceCoins_Q1' in item;
        const isPotion = item.category === 'Potions';
        const isFood = item.category === 'Food';

        return (
            <div key={item.Name} className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 hover:border-yellow-600 transition-all duration-200 hover:shadow-xl hover:shadow-yellow-600/20">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold ${item.Rarity ? getRarityColor(item.Rarity) : 'text-white'}`}>
                            {item.Name}
                        </h3>
                        <div className="flex gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded ${isPotion ? 'bg-purple-900 text-purple-300' : 'bg-gray-700'
                                }`}>
                                {item.category}
                            </span>
                            {item.InferredTier && (
                                <span className={`text-xs px-2 py-1 rounded text-white ${getTierColor(item.InferredTier)}`}>
                                    Tier {item.InferredTier}
                                </span>
                            )}
                            {item.Rarity && (
                                <span className={`text-xs px-2 py-1 rounded bg-gray-900 ${getRarityColor(item.Rarity)}`}>
                                    {item.Rarity}
                                </span>
                            )}
                            {item.BiomeProgression && (
                                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                                    Biome {item.BiomeProgression}
                                </span>
                            )}
                            {isPotion || isFood && 'set' in item && (
                                <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded">
                                    Set {item.set}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Display */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    {'Health' in item && <div className="text-red-400">❤️ Health: {item.Health}</div>}
                    {'Stamina' in item && <div className="text-green-400">⚡ Stamina: {item.Stamina}</div>}
                    {'Eitr' in item && item.Eitr > 0 && <div className="text-blue-400">🔮 Eitr: {item.Eitr}</div>}
                    {'Armor_Q1' in item && <div className="text-gray-300">🛡️ Armor: {item.Armor_Q1}-{item.Armor_Q4}</div>}
                    {'TotalStats' in item && <div className="text-yellow-400">📊 Total: {item.TotalStats}</div>}
                    {'Damage' in item && item.Damage && (
                        <div className="text-orange-400 col-span-2">
                            ⚔️ {Object.entries(item.Damage).map(([type, val]) => `${type}: ${val}`).join(', ')}
                        </div>
                    )}
                </div>

                {/* Potion Type Indicator */}
                {isPotion && (
                    <div className="mb-3 text-sm">
                        <div className="bg-purple-900/30 border border-purple-700 rounded p-2">
                            <span className="text-purple-300">🧪 Consumable Potion/Mead</span>
                        </div>
                    </div>
                )}

                {/* Price Display */}
                <div className="border-t border-gray-700 pt-3">
                    {hasQualityPricing && 'PriceCoins_Q1' in item ? (
                        <div>
                            <button
                                onClick={() => toggleItemExpansion(item.Name)}
                                className="flex items-center justify-between w-full text-yellow-500 font-bold mb-2 hover:text-yellow-400"
                            >
                                <span className="flex items-center gap-2">
                                    <Coins size={18} />
                                    Quality Pricing
                                </span>
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {isExpanded ? (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-gray-900 p-2 rounded">
                                        <span className="text-gray-400">Q1:</span>
                                        <span className="text-yellow-500 font-bold ml-2">{item.PriceCoins_Q1.toLocaleString()}</span>
                                    </div>
                                    {item.PriceCoins_Q2 && (
                                        <div className="bg-gray-900 p-2 rounded">
                                            <span className="text-gray-400">Q2:</span>
                                            <span className="text-yellow-500 font-bold ml-2">{item.PriceCoins_Q2.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {item.PriceCoins_Q3 && (
                                        <div className="bg-gray-900 p-2 rounded">
                                            <span className="text-gray-400">Q3:</span>
                                            <span className="text-yellow-500 font-bold ml-2">{item.PriceCoins_Q3.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="bg-gray-900 p-2 rounded">
                                        <span className="text-gray-400">Q4:</span>
                                        <span className="text-yellow-500 font-bold ml-2">{item.PriceCoins_Q4.toLocaleString()}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center bg-gray-900 p-2 rounded">
                                    <span className="text-yellow-500 font-bold text-lg">
                                        {item.PriceCoins_Q1.toLocaleString()} - {item.PriceCoins_Q4.toLocaleString()}
                                    </span>
                                    <span className="text-gray-400 text-sm ml-2">coins</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 bg-gray-900 p-3 rounded">
                            <Coins className="text-yellow-500" size={20} />
                            <span className="text-yellow-500 font-bold text-xl">
                                {getItemPrice(item).toLocaleString()}
                            </span>
                            <span className="text-gray-400">coins</span>
                        </div>
                    )}
                </div>

                {'Note' in item && item.Note && (
                    <div className="mt-3 text-xs text-gray-400 italic border-t border-gray-700 pt-2">
                        📝 {item.Note}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="bg-gray-900 border-b-4 border-yellow-600 shadow-lg">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-4xl font-bold text-yellow-500 mb-2 flex items-center gap-3">
                        ⚔️ Valheim Marketplace
                    </h1>
                    <p className="text-gray-400">
                        Starting Balance: <span className="text-yellow-500 font-bold">100,000 coins</span>
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-gray-700 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                <Search className="inline mr-2" size={16} />
                                Search Items
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name..."
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-yellow-500 text-white placeholder-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                <Filter className="inline mr-2" size={16} />
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-yellow-500 text-white"
                            >
                                <option>All</option>
                                <option>Armor</option>
                                <option>Food</option>
                                <option>Weapons</option>
                                <option>Potions</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Rarity</label>
                            <select
                                value={selectedRarity}
                                onChange={(e) => setSelectedRarity(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-yellow-500 text-white"
                            >
                                {rarities.map(rarity => (
                                    <option key={rarity}>{rarity}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Tier</label>
                            <select
                                value={selectedTier}
                                onChange={(e) => setSelectedTier(e.target.value === 'All' ? 'All' : parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-yellow-500 text-white"
                            >
                                {tiers.map(tier => (
                                    <option key={tier} value={tier}>{tier}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                <Coins className="inline mr-2" size={16} />
                                Max Price: {priceRange.max.toLocaleString()} coins
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1000000"
                                step="1000"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-yellow-500 text-white"
                            >
                                <option value="name">Name (A-Z)</option>
                                <option value="price-low">Price (Low to High)</option>
                                <option value="price-high">Price (High to Low)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mb-4 text-gray-400 flex justify-between items-center">
                    <span>
                        Showing <span className="text-yellow-500 font-bold">{filteredItems.length}</span> items
                    </span>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('All');
                            setSelectedRarity('All');
                            setSelectedTier('All');
                            setPriceRange({ min: 0, max: 1000000 });
                        }}
                        className="text-yellow-500 hover:text-yellow-400 text-sm"
                    >
                        Clear Filters
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map(item => renderItemCard(item))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12 bg-gray-800 rounded-lg border-2 border-gray-700">
                        <p className="text-gray-400 text-xl mb-2">⚠️ No items found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                    </div>
                )}
            </div>

            <div className="bg-gray-900 border-t-2 border-gray-700 mt-12 py-6">
                <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
                    <p>Valheim Server Marketplace • All prices in coins</p>
                </div>
            </div>
        </div>
    );
};

export default ValheimMarketplace;