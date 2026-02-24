import colorfulTheme from './colorful';
import futuristicTheme from './futuristic';
import natureTheme from './nature';

export const themes = {
  colorful: colorfulTheme,
  futuristic: futuristicTheme,
  nature: natureTheme,
};

export const themeList = Object.values(themes);

export const getTheme = (id) => themes[id] || colorfulTheme;

export { colorfulTheme, futuristicTheme, natureTheme };
