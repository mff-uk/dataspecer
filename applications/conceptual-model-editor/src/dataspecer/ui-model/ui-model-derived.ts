import { UiModel, UiTree } from "./ui-model";

/**
 * Given list of entities split them by their model.
 * The order of models is determined by model name.
 * Order of entities is preserved.
 */
export function splitByModel<T extends {
  model: UiModel,
}>(items: T[]): {
  model: UiModel,
  items: T[],
}[] {
  const map: Map<UiModel, T[]> = new Map();
  // Split
  for (const item of items) {
    const modelItems = map.get(item.model);
    if (modelItems === undefined) {
      map.set(item.model, [item]);
    } else {
      modelItems.push(item);
    }
  }
  // Create result array
  const result = [];
  for (const [model, items] of map.entries()) {
    result.push({ model, items });
  }
  // Sort
  result.sort((left, right) => left.model.displayLabel.localeCompare(right.model.displayLabel));
  return result;
}

/**
 * Given list of entities return a new array with new entities
 * prepared to be used in the user interface as a listing.
 *
 * Label is updated to allow for uniq identification of entities.
 * Entities are sorted based on he label.
 */
export function prepareForListing<T extends {
  displayLabel: string;
  model: UiModel,
}>(items: T[]): T[] {
  return items;
}

/**
 * Build a tree using profile relation.
 * Profiles can be from different model then the profiled items.
 */
export function buildProfileTree<T extends {
  dsIdentifier: string,
  model: {
    dsIdentifier: string,
  },
}, P extends {
  dsIdentifier: string,
  model: {
    dsIdentifier: string,
  },
  profiles: {
    profileOf: {
      entityDsIdentifier: string,
      modelDsIdentifier: string,
    }
  }[],
}>(items: T[], profiles: P[]): UiTree<T, P>[] {
  // First we start by putting items into the result.
  const result: UiTree<T, P>[] = items.map(item => ({
    node: item,
    children: [],
  }));
  // Add profiles.
  for (const item of result) {
    addProfilesToTree(item, profiles);
  }
  return result;
}

/**
 * Recursively adds profiles to given tree.
 * While not efficient, it was easy to implement.
 */
function addProfilesToTree<T extends {
  dsIdentifier: string,
  model: {
    dsIdentifier: string,
  },
}, P extends {
  dsIdentifier: string,
  model: {
    dsIdentifier: string,
  },
  profiles: {
    profileOf: {
      entityDsIdentifier: string,
      modelDsIdentifier: string,
    }
  }[],
}>(root: UiTree<T, P>, profiles: P[]): void {
  const dsIdentifier = root.node.dsIdentifier;
  const modelDsIdentifier = root.node.model.dsIdentifier;
  for (const profile of profiles) {
    for (const { profileOf } of profile.profiles) {
      if (profileOf.entityDsIdentifier === dsIdentifier
        && profileOf.modelDsIdentifier === modelDsIdentifier) {
        // It is a profile of this class.
        const node: UiTree<P, P> = {
          node: profile,
          children: [],
        };
        addProfilesToTree(node, profiles);
        root.children.push(node);
        break;
      }
    }
  }
}
