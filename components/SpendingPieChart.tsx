import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

interface Category {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface SpendingPieChartProps {
  categories: Category[];
}

export default function SpendingPieChart({ categories }: SpendingPieChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Platform.OS === 'web' ? Math.min(800, screenWidth - 72) : screenWidth - 72;
  
  const chartConfig = {
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#1a1a1a',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
  };

  const pieData = categories.map(category => ({
    name: `${category.name} (${category.percentage}%)`,
    population: category.amount,
    color: category.color,
    legendFontColor: '#fff',
    legendFontSize: 12
  }));

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <PieChart
          data={pieData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          hasLegend={true}
          center={[chartWidth * 0.25, 0]}
        />
      </View>
      <View style={styles.legend}>
        {categories.map((category, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: category.color }]} />
            <View style={styles.legendText}>
              <Text style={styles.legendTitle}>{category.name}</Text>
              <Text style={styles.legendValue}>₹{category.amount}</Text>
            </View>
            <Text style={styles.legendPercentage}>{category.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  legend: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
  },
  legendTitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  legendValue: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  legendPercentage: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});