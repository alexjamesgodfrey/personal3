export const generateColor = (uuid: string): string => {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 80%, 75%)`; // Increased saturation and lightness for brighter colors
};

export const getDarkColor = (color: string): string =>
  `hsl(${color.match(/\d+/) || [][0]}, 80%, 55%)`;
