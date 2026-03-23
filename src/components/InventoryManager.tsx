import { useState } from 'react';
import type { Character, Item } from '../types';

const WEAPONS = [
  { name: "Dagger", damage: "1d4", type: "piercing", weight: 1, cost: 2 },
  { name: "Shortsword", damage: "1d6", type: "piercing", weight: 2, cost: 10 },
  { name: "Longsword", damage: "1d8", type: "slashing", weight: 3, cost: 15 },
  { name: "Battleaxe", damage: "1d8", type: "slashing", weight: 4, cost: 10 },
  { name: "Greatsword", damage: "2d6", type: "slashing", weight: 6, cost: 50 },
  { name: "Handaxe", damage: "1d6", type: "slashing", weight: 2, cost: 10 },
  { name: "Javelin (x5)", damage: "1d6", type: "piercing", weight: 3, cost: 5 },
  { name: "Light Hammer", damage: "1d4", type: "bludgeoning", weight: 2, cost: 2 },
  { name: "Mace", damage: "1d6", type: "bludgeoning", weight: 4, cost: 5 },
  { name: "Quarterstaff", damage: "1d6", type: "bludgeoning", weight: 4, cost: 2 },
  { name: "Spear", damage: "1d6", type: "piercing", weight: 3, cost: 1 },
  { name: "Light Crossbow", damage: "1d8", type: "piercing", weight: 5, cost: 25 },
  { name: "Shortbow", damage: "1d6", type: "piercing", weight: 2, cost: 25 }
];

const ARMOR = [
  { name: "Leather Armor", ac: 11, dexBonus: true, weight: 10, cost: 10 },
  { name: "Studded Leather Armor", ac: 12, dexBonus: true, weight: 13, cost: 45 },
  { name: "Hide Armor", ac: 12, dexBonus: true, maxDex: 2, weight: 12, cost: 10 },
  { name: "Chain Shirt", ac: 13, dexBonus: true, maxDex: 2, weight: 20, cost: 50 },
  { name: "Scale Mail", ac: 14, dexBonus: true, maxDex: 2, weight: 45, cost: 50 },
  { name: "Breastplate", ac: 14, dexBonus: true, maxDex: 2, weight: 20, cost: 400 },
  { name: "Half Plate Armor", ac: 15, dexBonus: true, maxDex: 2, weight: 40, cost: 750 },
  { name: "Chain Mail", ac: 16, dexBonus: false, weight: 55, cost: 75 },
  { name: "Shield", ac: "+2", weight: 6, cost: 10 }
];

const GEAR = [
  { name: "Backpack", weight: 5, cost: 2 },
  { name: "Ball bearings (x10)", weight: 1, cost: 1 },
  { name: "Climber's Kit", weight: 12, cost: 25 },
  { name: "Dungeoneer's Pack", weight: 34, cost: 10 },
  { name: "Explorer's Pack", weight: 26, cost: 10 },
  { name: "Healer's Kit", weight: 1, cost: 5 },
  { name: "Holy Symbol", weight: 1, cost: 25 },
  { name: "Iron Pot", weight: 10, cost: 2 },
  { name: "Mess Kit", weight: 1, cost: 2 },
  { name: "Oil (flask)", weight: 1, cost: 1 },
  { name: "Rations (1 day)", weight: 2, cost: 5 },
  { name: "Rope (50 feet)", weight: 10, cost: 1 },
  { name: "Torch", weight: 1, cost: 1 },
  { name: "Waterskin", weight: 5, cost: 2 }
];

export default function InventoryManager({ character, setCharacter }: { character: Character; setCharacter: React.Dispatch<React.SetStateAction<Character>> }) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'weapons' | 'armor'>('inventory');
  const [newItemName, setNewItemName] = useState('');

  const addItemToInventory = (item: Item) => {
    setCharacter((prev: any) => ({
      ...prev,
      inventory: [...prev.inventory, item]
    }));
  };

  const updateItemQuantity = (itemId: string, delta: number) => {
    setCharacter((prev: any) => ({
      ...prev,
      inventory: prev.inventory.map((item: Item) => 
        item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    }));
  };

  const removeItemFromInventory = (itemId: string) => {
    setCharacter((prev: any) => ({
      ...prev,
      inventory: prev.inventory.filter((item: Item) => item.id !== itemId)
    }));
  };

  const calculateTotalWeight = () => {
    return character.inventory.reduce((total: number, item: Item) => total + (item.weight || 0) * item.quantity, 0);
  };

  const calculateCarryCapacity = () => {
    return character.abilityScores.strength * 15;
  };

  const renderInventoryList = () => (
    <div className="space-y-2">
      {character.inventory.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No items in inventory</p>
      ) : (
        character.inventory.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-750 rounded-lg">
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
              {item.weight && <div className="text-sm text-gray-400">{item.weight} lbs</div>}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => updateItemQuantity(item.id, -1)}
                className="px-2 py-1 bg-purple-700 rounded hover:bg-purple-600"
              >
                -
              </button>
              <span className="w-8 text-center font-bold">{item.quantity}</span>
              <button 
                onClick={() => updateItemQuantity(item.id, 1)}
                className="px-2 py-1 bg-purple-700 rounded hover:bg-purple-600"
              >
                +
              </button>
              <button 
                onClick={() => removeItemFromInventory(item.id)}
                className="text-red-400 hover:text-red-300 px-2"
              >
                ×
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderAddItemForm = () => (
    <div className="mb-6 p-4 bg-gray-750 rounded-lg">
      <h4 className="font-semibold mb-3">Add Item</h4>
      <input
        type="text"
        value={newItemName}
        onChange={(e) => setNewItemName(e.target.value)}
        placeholder="Enter item name..."
        className="w-full px-4 py-2 bg-gray-800 border border-purple-600 rounded-lg mb-3 focus:outline-none"
      />
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (newItemName.trim()) {
              addItemToInventory({
                id: Date.now().toString(),
                name: newItemName,
                quantity: 1,
                weight: 0,
                category: "adventure_gear" as const
              });
              setNewItemName('');
            }
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex-1"
        >
          Add Custom Item
        </button>
      </div>
    </div>
  );

  const renderWeaponList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {WEAPONS.map((weapon) => (
        <button
          key={weapon.name}
          onClick={() => addItemToInventory({
            id: Date.now().toString() + weapon.name,
            name: weapon.name,
            quantity: 1,
            weight: weapon.weight,
            costInGoldPieces: weapon.cost,
            category: "weapon" as const,
            properties: [`${weapon.damage} ${weapon.type}`]
          })}
          className="p-3 bg-gray-750 hover:bg-gray-700 rounded-lg text-left transition-all"
        >
          <div className="font-semibold">{weapon.name}</div>
          <div className="text-sm text-gray-400">{weapon.damage} {weapon.type} • {weapon.weight} lbs</div>
        </button>
      ))}
    </div>
  );

  const renderArmorList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ARMOR.map((armor) => (
        <button
          key={armor.name}
          onClick={() => addItemToInventory({
            id: Date.now().toString() + armor.name,
            name: armor.name,
            quantity: 1,
            weight: armor.weight,
            costInGoldPieces: armor.cost,
            category: "armor" as const,
            properties: [`AC ${armor.ac}`]
          })}
          className="p-3 bg-gray-750 hover:bg-gray-700 rounded-lg text-left transition-all"
        >
          <div className="font-semibold">{armor.name}</div>
          <div className="text-sm text-gray-400">AC {armor.ac} • {armor.weight} lbs</div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-purple-400">Inventory & Equipment</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700 pb-4">
        {['inventory', 'weapons', 'armor'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'inventory' | 'weapons' | 'armor')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all capitalize ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'inventory' && (
            <>
              {renderAddItemForm()}
              {renderInventoryList()}
            </>
          )}
          {activeTab === 'weapons' && renderWeaponList()}
          {activeTab === 'armor' && renderArmorList()}
        </div>

        {/* Stats Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-6 sticky top-4">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Carry Capacity</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Strength Score</span>
                <span className="font-bold">{character.abilityScores.strength}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Max Carry (lbs)</span>
                <span className="font-bold text-green-400">{calculateCarryCapacity()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Weight</span>
                <span className={`font-bold ${calculateTotalWeight() > calculateCarryCapacity() ? 'text-red-400' : 'text-blue-400'}`}>
                  {calculateTotalWeight()} / {calculateCarryCapacity()} lbs
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      calculateTotalWeight() > calculateCarryCapacity() * 0.9 ? 'bg-red-500' :
                      calculateTotalWeight() > calculateCarryCapacity() * 0.6 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (calculateTotalWeight() / calculateCarryCapacity()) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Gold Summary */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h4 className="font-semibold mb-3 text-purple-400">Currency</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-yellow-400">Platinum (pp)</span>
                    <span className="font-bold">{character.platinumPieces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Gold (gp)</span>
                    <span className="font-bold">{character.goldPieces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Electrum (ep)</span>
                    <span className="font-bold">{character.electrumPieces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Silver (sp)</span>
                    <span className="font-bold">{character.silverPieces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-copper-500">Copper (cp)</span>
                    <span className="font-bold">{character.copperPieces}</span>
                  </div>
                </div>
              </div>

              {/* Quick Add Gear */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h4 className="font-semibold mb-3 text-purple-400">Quick Add Common Gear</h4>
                <div className="grid grid-cols-2 gap-2">
{GEAR.slice(0, 6).map((item) => (
                      <button
                        key={item.name}
                        onClick={() => addItemToInventory({
                          id: Date.now().toString() + item.name,
                          name: item.name,
                          quantity: 1,
                          weight: item.weight,
                          costInGoldPieces: item.cost,
                          category: "adventure_gear" as const
                        })}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-650 rounded text-sm transition-all"
                      >
                        {item.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
