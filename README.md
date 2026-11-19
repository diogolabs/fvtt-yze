# Year Zero Engine (Generic SRD) — Foundry VTT System (`fvtt-yze`)

A clean, minimalist, generic **Year Zero Engine (YZE)** system for **Foundry VTT (v13 / v14)** implementing the official **Year Zero Engine Standard Reference Document (YZE SRD v1.0)**.

## ✨ Features

- **Dice Pool & Step Dice Modes**:
  - Switch globally in System Settings (or override per actor) between **Dice Pool** (1–5 Attributes, 0–5 Skills, Base/Skill/Gear/Artifact Dice) and **Step Dice** (D / C / B / A = `d6` / `d8` / `d10` / `d12` with automatic step-up/step-down balancing or Advantage/Disadvantage).
- **Configurable YZE Core Variants**:
  - **Damage & Trauma**: *Health & Resolve*, *Direct Attribute Damage*, or *Conditions* (Exhausted, Battered, Wounded, Angry, Scared, Disheartened).
  - **Cost of Pushing**: *Damage & Stress*, *Attribute Damage (+ Willpower Points)*, *Stress Dice (+ Panic Table Rolls)*, *Conditions*, or *Doom Points*.
  - **Encumbrance**: Standard SRD carry limit (`2 × STR` in Dice Pool, `STR Die Size` in Step Dice), Backpack bonus, and optional *Weapons at Hand* rule.
- **Modular Everything-as-Item Architecture**:
  - **Skills (`skill`)**: Connected to an Attribute (`strength`, `agility`, `wits`, `empathy`), with both Dice Pool level (`0–5`) and Step Die rating (`None / D / C / B / A`), plus XP advancement mark. Includes 1-click seeding of the **12 Core SRD Skills**.
  - **Specialties / Talents (`specialty`)**: General, Combat, Archetype, or Magic disciplines; supports tiered ranks (`1–3`), roll modifiers, max push overrides (e.g., *True Grit*, *Reckless*, *Inquisitive*, *Compassion*), Willpower costs, and passive Health/Resolve/Carry bonuses.
  - **Weapons (`weapon`)**: Grip (`1H`/`2H`), Bonus / Reliability (auto-degrades on pushed gear banes, repairable), Base Damage, Crit Threshold, Range, Rate of Fire & Magazine (supports **Ammo Dice** rules), and **Artifact Dice** (`D8` Mighty, `D10` Epic, `D12` Legendary).
  - **Armor (`armor`)**: Body Armor, Helmets, Shields, and Cover with Dice Pool rating (`0–12`) and Step Die (`D–A`), 1-click Armor Roll, and degradation.
  - **Gear & Consumables (`gear`)**: Regular, Light (`½`), Quarter (`¼`), Tiny (`0`), and Heavy (`2+`) items, Backpacks, Tools with Gear Bonus, and Consumables with 1-click **Supply Rolls**.
  - **Spells (`spell`)**: Full SRD Chapter 5 Magic implementation — Disciplines, Ranks (`1–3+`), Action/Power Word/Ritual, Grimoire support, Willpower Point (WP) expenditure, **Safe Casting**, **Chance Casting**, **Overcharging**, and 1-click **Magic Mishap (D12)** rolls.
  - **Critical Injuries (`critical`)**: Physical and Mental critical injuries with Lethal status, Time Limit, Death Saves (`Stamina`), Stabilization (`Healing`), and built-in **D66 Physical / D66 Mental / D12 Vehicle Critical Injury Table** rollers.
- **Actors**:
  - **Character (`character`)**: Full player character sheet with Attributes, Derived Ratings, Conditions, Skills, Combat & Gear, Specialties & Magic, Personality Traits (*Pride*, *Weakness*, *Dark Secret*, *Big Dream*, *Buddy*, *Relationships*), and Active Effects.
  - **NPC (`npc`)**: Fast, minimalist NPC / Creature sheet.
  - **Vehicle (`vehicle`)**: Passengers, Maneuverability, Hull, Armor, Travel Speed, Fuel, Mounted Weapons, Cargo, Drive/Maneuver Roll, Ramming Attack, and Component Damage table roller.

## 🚀 Installation

### Foundry VTT v14 (Latest)
Manifest URL:
```
https://github.com/diogolabs/fvtt-yze/releases/latest/download/system.json
```

### Foundry VTT v13
Manifest URL:
```
https://github.com/diogolabs/fvtt-yze/releases/download/v1.0.1/system.json
```

## 📜 License

- **Code**: MIT / GPLv3 (uses [YZUR](https://github.com/Stefouch/foundry-year-zero-roller) by Stefouch, MIT License).
- **Rules Reference**: Created under the **Year Zero Engine Free Tabletop License (FTL)** based on the *Year Zero Engine Standard Reference Document v1.0* © 2023 Fria Ligan AB.
