
import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { StyleProp, ViewStyle, Text } from "react-native";

export function IconSymbol({
  ios_icon_name,
  android_material_icon_name,
  size = 24,
  color,
  style,
  weight = "regular",
}: {
  ios_icon_name: SymbolViewProps["name"];
  android_material_icon_name: any;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Validate that ios_icon_name is provided
  if (!ios_icon_name) {
    console.warn(`[IconSymbol iOS] Missing ios_icon_name. Using fallback icon.`);
    return (
      <Text style={[{ fontSize: size, color }, style]}>
        ?
      </Text>
    );
  }

  try {
    return (
      <SymbolView
        weight={weight}
        tintColor={color}
        resizeMode="scaleAspectFit"
        name={ios_icon_name}
        style={[
          {
            width: size,
            height: size,
          },
          style,
        ]}
        fallback={
          <Text style={[{ fontSize: size, color }, style]}>
            ?
          </Text>
        }
      />
    );
  } catch (error) {
    console.warn(`[IconSymbol iOS] Error rendering SF Symbol "${ios_icon_name}":`, error);
    return (
      <Text style={[{ fontSize: size, color }, style]}>
        ?
      </Text>
    );
  }
}
