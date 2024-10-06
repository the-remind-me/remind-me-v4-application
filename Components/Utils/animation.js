import {
  interpolate,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

/**
 * Utility to handle the underline animation based on the swipe progress.
 * @param {number} numberOfItems - The total number of items in the FlatList.
 * @param {number} underlineWidth - The width of the underline (one item).
 * @returns {Object} - Object containing the animated style and the scroll handler.
 */
export const useSwipeUnderlineAnimation = (
  numberOfItems,
  underlineWidth = 50
) => {
  const translateX = useSharedValue(0); // Shared value to track the underline position

  // Handle the scroll event from PagerView
  const handlePageScroll = (e) => {
    const { offset, position } = e.nativeEvent;
    translateX.value = position + offset;
  };

  // Define the animated style for the underline
  const underlineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          translateX.value,
          [0, numberOfItems - 1],
          [0, (numberOfItems - 1) * underlineWidth]
        ),
      },
    ],
  }));

  return { underlineStyle, handlePageScroll };
};
