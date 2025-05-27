// components/SpendingPieChart.tsx
import { View, Text, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native'; // Added TouchableOpacity
import { PieChart } from 'react-native-chart-kit';

// Updated interface name for clarity and made percentage optional
export interface CategorySpendingData {
  name: string;
  amount: number;
  color: string;
  percentage?: number; // Percentage might be calculated or provided
}

interface SpendingPieChartProps {
  categories: CategorySpendingData[];
  onCategorySelect?: (categoryName: string) => void; // New prop for callback
}

export default function SpendingPieChart({ categories, onCategorySelect }: SpendingPieChartProps) {
  const screenWidth = Dimensions.get('window').width;
  // Adjusted chartWidth for potentially smaller padding in the container
  const chartWidth = Platform.OS === 'web' ? Math.min(800, screenWidth - 40) : screenWidth - 40;

  const chartConfig = {
    backgroundGradientFrom: '#2a2a2a', // Matching the container background
    backgroundGradientTo: '#2a2a2a',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Color for chart lines/text if any
    strokeWidth: 2,
    decimalPlaces: 0, // For values displayed on chart (if any)
    propsForLabels: { // Style for labels on the chart itself (if shown)
        fontFamily: 'Inter-Regular',
        fontSize: 11, // Keep small if using a detailed legend
    }
  };

  // Calculate total for percentages if not already provided in categories
  const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);

  const pieData = categories.map(category => {
    // The 'name' for the chart data point can be simpler if legend handles details
    return {
      name: category.name, // Pie chart internal name, legend will display full info
      population: category.amount, // Value for the slice
      color: category.color,
      legendFontColor: '#FFF', // Default, but we're using a custom legend
      legendFontSize: 12,     // Default, but we're using a custom legend
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <PieChart
          data={pieData}
          width={chartWidth}
          height={220} // Standard height
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent" // Important for the container background to show
          paddingLeft="15" // Default from react-native-chart-kit, adjust as needed
          // 'absolute' shows absolute values on slices. Can be true or false.
          // If false, and if you provide percentages in pieData.name, it might show those.
          // For clarity, let's keep it consistent with the legend showing amounts.
          absolute={false}
          hasLegend={false} // Set to false as we are rendering a custom, clickable legend below
          // Center prop: [xOffset, yOffset] from top-left. Adjust to visually center the pie.
          center={[Platform.OS === 'web' ? chartWidth * 0.15 : chartWidth * 0.18, 0]}
        />
      </View>

      {/* Custom Clickable Legend */}
      <View style={styles.legendContainer}>
        {categories.map((category, index) => {
          const percentage = totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0;
          return (
            <TouchableOpacity
              key={index}
              style={styles.legendItem}
              onPress={() => onCategorySelect && onCategorySelect(category.name)}
              activeOpacity={0.7} // Visual feedback on press
            >
              <View style={[styles.legendColor, { backgroundColor: category.color }]} />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendTitle} numberOfLines={1} ellipsizeMode="tail">
                  {category.name}
                </Text>
                <Text style={styles.legendValue}>₹{category.amount.toFixed(2)}</Text>
              </View>
              <Text style={styles.legendPercentage}>{percentage.toFixed(1)}%</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a', // Matches the chart's background for seamless look
    borderRadius: 16,
    paddingVertical: 16, // Padding for the whole component
    paddingHorizontal: 10, // Slight horizontal padding
  },
  chartWrapper: {
    alignItems: 'center',
    // No bottom margin here, legendContainer will provide spacing
  },
  legendContainer: {
    marginTop: 16, // Space between chart and legend
    paddingHorizontal: 6, // Inner padding for legend items alignment
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Make legend items taller for easier tapping
    // borderBottomWidth: 1, // Optional separator line
    // borderBottomColor: '#3a3a3a', // Slightly darker separator
    marginBottom: 5, // Space between legend items
    borderRadius: 8, // Slightly rounded legend items for modern look
    paddingHorizontal: 8, // Padding inside each legend item
    // backgroundColor: '#303030', // Optional: Slight background for each item
  },
  legendColor: {
    width: 14, // Legend color swatch size
    height: 14,
    borderRadius: 7, // Make it circular
    marginRight: 12,
  },
  legendTextContainer: {
    flex: 1, // Allow text to take available space and push percentage to the right
    marginRight: 8, // Space before percentage
  },
  legendTitle: {
    color: '#e0e0e0', // Brighter white for better readability
    fontSize: 14,    // Standard readable size
    fontFamily: 'Inter-Regular', // Ensure your font is loaded
  },
  legendValue: {
    color: '#999999', // Softer color for secondary info
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  legendPercentage: {
    color: '#e0e0e0',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold', // Make percentage stand out a bit
  },
});