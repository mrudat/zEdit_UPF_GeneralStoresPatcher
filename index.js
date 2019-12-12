/* eslent-env node */
/* global xelib, registerPatcher, patcherUrl, info */
// ngapp is global but unused.

const {
  AddFormID,
  FileByName,
  GetArmorType,
  GetElement,
  GetElements,
  GetValue,
  GetWinningOverride,
  GetFlag,
  GetLinksTo,
  HasElement,
  HasKeyword,
  LongName,
  Signature
} = xelib

function FormID (record) {
  return GetValue(record, 'Record Header\\FormID')
}

registerPatcher({
  info: info,
  gameModes: [xelib.gmTES5, xelib.gmSSE],
  requiredFiles: ['Skyrim.esm', 'GeneralStores.esm'],
  settings: {
    label: info.name,
    templateUrl: `${patcherUrl}/partials/settings.html`,
    defaultSettings: {
      patchFileName: 'zPatch.esp'
    }
  },
  execute: (patchFile, helpers, settings, locals) => ({
    customProgress: function (filesToPatch) {
      // const filesToPatchCount = locals.filesToPatchCount = filesToPatch.length
      const filesToPatchCount = 1
      return filesToPatchCount * 9
    },
    initialize: function () {
      /*
      const {
        filesToPatchCount
      } = locals
      */
      const filesToPatchCount = 1
      const {
        loadRecords,
        copyToPatch,
        logMessage,
        addProgress
      } = helpers

      const skyrimEsm = FileByName('skyrim.esm')
      const skyrimKYWDgrup = GetElement(skyrimEsm, 'KYWD')

      const workbenchFilter = locals.workbenchFilter = new Set()
      const workbenches = locals.workbenches = {}

      for (const kywdName of ['CraftingSmelter', 'CraftingSmithingForge', 'CraftingCookpot', 'CraftingTanningRack', 'isGrainMill']) {
        workbenchFilter.add(workbenches[kywdName] = FormID(GetElement(skyrimKYWDgrup, kywdName)))
      }

      const hearthFiresESM = FileByName('HearthFires.esm')
      const hearthFiresKYWDgrup = GetElement(hearthFiresESM, 'KYWD')

      if (hearthFiresESM) {
        for (const kywdName of ['BYOHCraftingOven', 'BYOHCarpenterTable']) {
          workbenchFilter.add(workbenches[kywdName] = FormID(GetElement(hearthFiresKYWDgrup, kywdName)))
        }
      }

      const potionKYWD = FormID(GetElement(skyrimKYWDgrup, 'VendorItemPotion'))
      const poisonKYWD = FormID(GetElement(skyrimKYWDgrup, 'VendorItemPoison'))

      const alchemyAndCookingSet = new Set()
      const alchemyAndSmithingSet = new Set()
      const allArmorSet = new Set()
      const allFoodSet = new Set()
      const allSmithingSet = new Set()
      const allWeaponsSet = new Set()
      const archeryWeaponSet = new Set()
      const clothingSet = new Set()
      const cookedFoodSet = new Set()
      const hearthFiresConstructionSet = new Set()
      const heavyArmorSet = new Set()
      const lightArmorSet = new Set()
      const oneHandedWeaponSet = new Set()
      const rawFoodSet = new Set()
      const shieldSet = new Set()
      const smeltingSet = new Set()
      const smithingSet = new Set()
      const staffWeaponSet = new Set()
      const tanningSet = new Set()
      const twoHandedWeaponSet = new Set()
      const potionsSet = new Set()
      const poisonsSet = new Set()
      const allPotionsSet = new Set()
      const bookSet = new Set()
      const spellTomeSet = new Set()
      const ingredientSet = new Set()
      const scrollSet = new Set()

      logMessage('--- Starting to process COBJs')

      for (const cobj of loadRecords('COBJ', false)) {
        const workbench = GetValue(cobj, 'BNAM')
        if (!workbenchFilter.has(workbench)) continue

        switch (workbench) {
          case workbenches.isGrainMill:
          case workbenches.CraftingCookpot:
          case workbenches.BYOHCraftingOven:
            break
          default:
            if (!HasElement(cobj, 'Items')) continue
        }
        // logMessage(`Making sure General Stores knows about ${LongName(cobj)}`)

        switch (workbench) {
          case workbenches.CraftingSmelter:
            for (const item of GetElements(cobj, 'Items')) {
              const theItem = GetValue(item, 'CNTO\\Item')
              allSmithingSet.add(theItem)
              smeltingSet.add(theItem)
            }
            break
          case workbenches.CraftingSmithingForge:
            for (const item of GetElements(cobj, 'Items')) {
              const theItem = GetLinksTo(item, 'CNTO\\Item')
              const theItemFormID = FormID(theItem)
              if (Signature(theItem) === 'INGR') {
                alchemyAndSmithingSet.add(theItemFormID)
              }
              allSmithingSet.add(theItemFormID)
              smithingSet.add(theItemFormID)
            }
            break
          case workbenches.CraftingCookpot:
          case workbenches.BYOHCraftingOven:
            {
              const result = GetValue(cobj, 'CNAM')
              allFoodSet.add(result)
              cookedFoodSet.add(result)
            }
            if (HasElement(cobj, 'Items')) {
              for (const item of GetElements(cobj, 'Items')) {
                const theItem = GetLinksTo(item, 'CNTO\\Item')
                const theItemFormID = FormID(theItem)
                if (Signature(theItem) === 'INGR') {
                  alchemyAndCookingSet.add(theItemFormID)
                }
                rawFoodSet.add(theItemFormID)
                allFoodSet.add(theItemFormID)
              }
            }
            break
          case workbenches.isGrainMill:
            {
              const result = GetValue(cobj, 'CNAM')
              rawFoodSet.add(result)
              cookedFoodSet.add(result)
            }
            if (HasElement(cobj, 'Items')) {
              for (const item of GetElements(cobj, 'Items')) {
                const theItem = GetLinksTo(item, 'CNTO\\Item')
                const theItemFormID = FormID(theItem)
                if (Signature(theItem) === 'INGR') {
                  alchemyAndCookingSet.add(theItemFormID)
                }
                rawFoodSet.add(theItemFormID)
                allFoodSet.add(theItemFormID)
              }
            }
            break
          case workbenches.CraftingTanningRack:
            for (const item of GetElements(cobj, 'Items')) {
              const theItem = GetValue(item, 'CNTO\\Item')
              tanningSet.add(theItem)
              allSmithingSet.add(theItem)
            }
            break
          case workbenches.BYOHCarpenterTable:
            for (const item of GetElements(cobj, 'Items')) {
              const theItem = GetValue(item, 'CNTO\\Item')
              allSmithingSet.add(theItem)
              hearthFiresConstructionSet.add(theItem)
            }
            break
        }
      }
      addProgress(filesToPatchCount)

      logMessage('--- Starting to process WEAPs')

      for (const weap of loadRecords('WEAP', false)) {
        const formID = FormID(weap)
        allWeaponsSet.add(formID)

        const dnam = GetElement(weap, 'DNAM')
        if (!dnam) continue

        switch (GetValue(dnam, 'Animation Type')) {
          case 'Staff':
            staffWeaponSet.add(formID)
            break
          default:
            switch (GetValue(dnam, 'Skill')) {
              case 'One Handed':
                oneHandedWeaponSet.add(formID)
                break
              case 'Two Handed':
                twoHandedWeaponSet.add(formID)
                break
              case 'Archery':
                archeryWeaponSet.add(formID)
                break
            }
        }
      }
      addProgress(filesToPatchCount)

      logMessage('--- Starting to process ARMOs')

      for (const armo of loadRecords('ARMO', false)) {
        const formID = FormID(armo)
        allArmorSet.add(formID)

        const bodt = GetElement(armo, 'BODT') || GetElement(armo, 'BOD2')
        if (!bodt) continue

        if (GetFlag(bodt, 'First Person Flags', '39 - Shield')) {
          shieldSet.add(formID)
        } else {
          switch (GetArmorType(armo)) {
            case 'Clothing':
              clothingSet.add(formID)
              break
            case 'Light Armor':
              lightArmorSet.add(formID)
              break
            case 'Heavy Armor':
              heavyArmorSet.add(formID)
              break
          }
        }
      }
      addProgress(filesToPatchCount)

      logMessage('--- Starting to process ALCHs')

      for (const alch of loadRecords('ALCH', false)) {
        const formID = FormID(alch)
        // TODO KYWD or ENIT\\Flags\\Food Item?
        // Flags - Food Item/Medicine/Poison - not used?
        if (HasKeyword(alch, potionKYWD)) {
          allPotionsSet.add(formID)
          potionsSet.add(formID)
        } else if (HasKeyword(alch, poisonKYWD)) {
          allPotionsSet.add(formID)
          poisonsSet.add(formID)
        } else {
          allFoodSet.add(formID)
        }
      }
      addProgress(filesToPatchCount)

      logMessage('--- Starting to process BOOKs')

      for (const book of loadRecords('BOOK', false)) {
        const formID = FormID(book)
        bookSet.add(formID)
        if (GetFlag(book, 'DATA\\Flags', 'Teaches Spell')) {
          spellTomeSet.add(formID)
        }
      }
      addProgress(filesToPatchCount)

      logMessage('--- Starting to process INGRs')

      for (const ingr of loadRecords('INGR', false)) {
        ingredientSet.add(FormID(ingr))
      }
      addProgress(filesToPatchCount)

      logMessage('--- Starting to process SCRLs')

      for (const scrl of loadRecords('SCRL', false)) {
        scrollSet.add(FormID(scrl))
      }
      addProgress(filesToPatchCount)

      logMessage('--- Starting to process AMMOs')

      for (const ammo of loadRecords('AMMO', false)) {
        archeryWeaponSet.add(FormID(ammo))
      }
      addProgress(filesToPatchCount)

      logMessage('--- Applying found records to FLSTs')

      function applySetToFLST (flst, set) {
        flst = copyToPatch(GetWinningOverride(flst), false)

        const missingSet = new Set()

        for (const entry of GetElements(flst, 'FormIDs')) {
          const formID = GetValue(entry)
          if (set.has(formID)) {
            set.delete(formID)
          } else {
            missingSet.add(formID)
          }
        }

        logMessage(`Found ${set.size} new records for ${LongName(flst)}`)
        if (missingSet.size > 0) {
          logMessage(`[WARN] ${missingSet.size} records that were already in ${LongName(flst)} weren't found:`)
          for (const formID of missingSet) {
            logMessage(`  ${formID}`)
          }
        }

        for (const formID of set) {
          AddFormID(flst, formID)
        }
      }

      const generalStoresEsm = FileByName('GeneralStores.esm')
      const generalStoresFLSTgroup = GetElement(generalStoresEsm, 'FLST')

      // applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxTreasuresFLST'), )
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxAlchCookFLST'), alchemyAndCookingSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxAlchSmithFLST'), alchemyAndSmithingSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxAllSmithFLST'), allSmithingSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxArmorAllFLST'), allArmorSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxArmorClothingFLST'), clothingSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxArmorHeavyFLST'), heavyArmorSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxArmorLightFLST'), lightArmorSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxArmorShieldsFLST'), shieldSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxBooksFLST'), bookSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxFoodAllFLST'), allFoodSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxFoodCookedFLST'), cookedFoodSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxFoodRawFLST'), rawFoodSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxFoodRawFLST'), rawFoodSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxIngredientFLST'), ingredientSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxPotionsAllFLST'), potionsSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxPotionsBadFLST'), poisonsSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxPotionsGoodFLST'), allPotionsSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxScrollsFLST'), scrollSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxSmeltingFLST'), smeltingSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxSmithingFLST'), smithingSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxSpellTomesFLST'), spellTomeSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxTanningFLST'), tanningSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxWeaponArcheryFLST'), archeryWeaponSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxWeaponOneHandedFLST'), oneHandedWeaponSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxWeaponsAllFLST'), allWeaponsSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxWeaponStaffFLST'), staffWeaponSet)
      applySetToFLST(GetElement(generalStoresFLSTgroup, 'xGSxWeaponTwoHandedFLST'), twoHandedWeaponSet)

      const hearthFiresGSEsm = FileByName('HearthFires(GS).esm')
      if (hearthFiresGSEsm) {
        const hearthFiresFLSTgroup = GetElement(hearthFiresGSEsm, 'FLST')
        applySetToFLST(GetElement(hearthFiresFLSTgroup, 'xHFSxConstructionFLST'), hearthFiresConstructionSet)
        // applySetToFLST(GetElement(hearthFiresFLSTgroup, 'xHFSxIngredientsFLST'), twoHandedWeaponSet)
      }
      addProgress(filesToPatchCount)

      logMessage('-- GeneralStores patcher done.')
    }
  })
})
