import { UiVocabulary, UiTree } from "./ui-model";

/**
 * Given list of entities split them by their model.
 * The order of models is determined by model name.
 * Order of entities is preserved.
 */
export function splitByModel<T extends {
  vocabulary: UiVocabulary,
}>(items: T[]): {
  vocabulary: UiVocabulary,
  items: T[],
}[] {
  const map: Map<UiVocabulary, T[]> = new Map();
  // Split
  for (const item of items) {
    const vocabularyItems = map.get(item.vocabulary);
    if (vocabularyItems === undefined) {
      map.set(item.vocabulary, [item]);
    } else {
      vocabularyItems.push(item);
    }
  }
  // Create result array
  const result = [];
  for (const [vocabulary, items] of map.entries()) {
    result.push({ vocabulary, items });
  }
  // Sort
  result.sort((left, right) => left.vocabulary.displayLabel.localeCompare(
    right.vocabulary.displayLabel));
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
  vocabulary: UiVocabulary,
}>(items: T[]): T[] {
  return items;
}

/**
 * Build a tree using profile relation.
 * Profiles can be from different model then the profiled items.
 */
export function buildProfileTree<T extends {
  dsIdentifier: string,
  vocabulary: {
    dsIdentifier: string,
  },
}, P extends {
  dsIdentifier: string,
  vocabulary: {
    dsIdentifier: string,
  },
  profiles: {
    profileOf: {
      entityDsIdentifier: string,
      vocabularyDsIdentifier: string,
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
  vocabulary: {
    dsIdentifier: string,
  },
}, P extends {
  dsIdentifier: string,
  vocabulary: {
    dsIdentifier: string,
  },
  profiles: {
    profileOf: {
      entityDsIdentifier: string,
      vocabularyDsIdentifier: string,
    }
  }[],
}>(root: UiTree<T, P>, profiles: P[]): void {
  const dsIdentifier = root.node.dsIdentifier;
  const modelDsIdentifier = root.node.vocabulary.dsIdentifier;
  for (const profile of profiles) {
    for (const { profileOf } of profile.profiles) {
      if (profileOf.entityDsIdentifier === dsIdentifier
        && profileOf.vocabularyDsIdentifier === modelDsIdentifier) {
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
