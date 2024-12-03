
export function removeFromArray<Type>(array: Type[], value: Type): Type[] {
  const index = array.indexOf(value);
  if (index === -1) {
    return array;
  } else {
    return [
      ...array.slice(0, index),
      ...array.slice(index + 1),
    ];
  }
}
