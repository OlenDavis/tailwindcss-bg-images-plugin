import plugin from "tailwindcss/plugin";
import { globSync } from "glob";
import { CSSRuleObject } from "tailwindcss/types/config";

export default function pluginBgImages({
  globOptionsByPattern = {
    "./assets/**/*.@(jpg|jpeg|png|gif|svg|webp)": { dot: true },
  },
  makeStyle = function (imagePath: string) {
    return { backgroundImage: `url('~/${imagePath}')` };
  },
  makeUtilityWithExtension = function (imagePath: string) {
    return imagePath.replace(/^assets[\/\\]/, "");
  },
  makeUtilityWithoutExtension = function (imagePath: string) {
    return imagePath.replace(/^assets[\/\\]|\.\w+$/g, "");
  },
  utilityPrefix = "bg-",
} = {}) {
  return plugin(function ({ addUtilities, e }) {
    Object.entries(globOptionsByPattern).forEach(([pattern, globOptions]) => {
      const imagePaths = globSync(pattern, globOptions);
      const utilities = imagePaths
        .flatMap((imagePath) => {
          const style = makeStyle?.(imagePath);
          if (style) {
            const withExtension = makeUtilityWithExtension?.(imagePath);
            const withoutExtension = makeUtilityWithoutExtension?.(imagePath);
            return [withExtension, withoutExtension]
              .filter(Boolean)
              .map(
                (utility) => [`.${utilityPrefix}${e(utility)}`, style] as const
              );
          } else {
            return [];
          }
        })
        .reduce(
          (acc, [key, value]) => Object.assign(acc, { [key]: value }),
          {} as CSSRuleObject
        );
      addUtilities(utilities);
    });
  });
}
