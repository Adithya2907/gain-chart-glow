import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Weight, Activity } from 'lucide-react';
import { BodyMeasurement } from '@/types/workout';
import { format } from 'date-fns';

interface BodyMeasurementsProgressProps {
  measurements: BodyMeasurement[];
}

type MeasurementType = 'weight' | 'bodyFat' | 'chest' | 'waist' | 'hips' | 'biceps' | 'thighs';

export function BodyMeasurementsProgress({ measurements }: BodyMeasurementsProgressProps) {
  const [selectedMetric, setSelectedMetric] = useState<MeasurementType>('weight');

  const getMetricValue = (m: BodyMeasurement, metric: MeasurementType): number => {
    switch (metric) {
      case 'weight':
        return m.weight || 0;
      case 'bodyFat':
        return m.bodyFat || 0;
      case 'chest':
        return m.chest || 0;
      case 'waist':
        return m.waist || 0;
      case 'hips':
        return m.hips || 0;
      case 'biceps':
        return m.biceps || 0;
      case 'thighs':
        return m.thighs || 0;
      default:
        return 0;
    }
  };

  const chartData = useMemo(() => {
    if (measurements.length === 0) return [];

    return measurements
      .filter((m) => {
        switch (selectedMetric) {
          case 'weight':
            return m.weight !== undefined;
          case 'bodyFat':
            return m.bodyFat !== undefined;
          case 'chest':
            return m.chest !== undefined;
          case 'waist':
            return m.waist !== undefined;
          case 'hips':
            return m.hips !== undefined;
          case 'biceps':
            return m.biceps !== undefined;
          case 'thighs':
            return m.thighs !== undefined;
          default:
            return false;
        }
      })
      .map((m) => {
        const date = new Date(m.date);
        return {
          date: format(date, 'MMM d'),
          fullDate: m.date,
          value: getMetricValue(m, selectedMetric),
        };
      })
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [measurements, selectedMetric]);

  const getMetricLabel = (metric: MeasurementType): string => {
    switch (metric) {
      case 'weight':
        return 'Weight (kg)';
      case 'bodyFat':
        return 'Body Fat (%)';
      case 'chest':
        return 'Chest (cm)';
      case 'waist':
        return 'Waist (cm)';
      case 'hips':
        return 'Hips (cm)';
      case 'biceps':
        return 'Biceps (cm)';
      case 'thighs':
        return 'Thighs (cm)';
      default:
        return '';
    }
  };

  const getMetricUnit = (metric: MeasurementType): string => {
    switch (metric) {
      case 'weight':
        return 'kg';
      case 'bodyFat':
        return '%';
      default:
        return 'cm';
    }
  };

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const values = chartData.map((d) => d.value).filter((v) => v > 0);
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const latest = values[values.length - 1];
    const first = values[0];
    const change = latest - first;
    const changePercent = first > 0 ? ((change / first) * 100).toFixed(1) : '0';

    return {
      latest,
      first,
      change,
      changePercent,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      totalMeasurements: chartData.length,
    };
  }, [chartData]);

  if (measurements.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-muted-foreground/40 mx-auto" />
        <p className="text-muted-foreground mt-4">No measurements recorded yet.</p>
        <p className="text-muted-foreground/60 text-sm mt-1">
          Add measurements to track your progress over time!
        </p>
      </div>
    );
  }

  const availableMetrics = [
    { value: 'weight' as MeasurementType, label: 'Weight' },
    { value: 'bodyFat' as MeasurementType, label: 'Body Fat' },
    { value: 'chest' as MeasurementType, label: 'Chest' },
    { value: 'waist' as MeasurementType, label: 'Waist' },
    { value: 'hips' as MeasurementType, label: 'Hips' },
    { value: 'biceps' as MeasurementType, label: 'Biceps' },
    { value: 'thighs' as MeasurementType, label: 'Thighs' },
  ].filter((m) =>
    measurements.some((measurement) => {
      switch (m.value) {
        case 'weight':
          return measurement.weight !== undefined;
        case 'bodyFat':
          return measurement.bodyFat !== undefined;
        case 'chest':
          return measurement.chest !== undefined;
        case 'waist':
          return measurement.waist !== undefined;
        case 'hips':
          return measurement.hips !== undefined;
        case 'biceps':
          return measurement.biceps !== undefined;
        case 'thighs':
          return measurement.thighs !== undefined;
        default:
          return false;
      }
    })
  );

  if (availableMetrics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No measurement data available for charts.</p>
        <p className="text-muted-foreground/60 text-sm mt-1">
          Add measurements with values to see progress charts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4">
        <label className="text-sm text-muted-foreground">Select Metric</label>
        <Select
          value={selectedMetric}
          onValueChange={(v: MeasurementType) => setSelectedMetric(v)}
        >
          <SelectTrigger className="mt-2 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableMetrics.map((metric) => (
              <SelectItem key={metric.value} value={metric.value}>
                {metric.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {chartData.length > 0 && stats && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto" />
              <p className="text-2xl font-bold mt-2">
                {stats.latest.toFixed(selectedMetric === 'weight' ? 1 : 1)}
              </p>
              <p className="text-xs text-muted-foreground">Latest ({getMetricUnit(selectedMetric)})</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Weight className="w-5 h-5 text-primary mx-auto" />
              <p className="text-2xl font-bold mt-2">
                {stats.change >= 0 ? '+' : ''}
                {stats.change.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">
                Change ({getMetricUnit(selectedMetric)})
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Activity className="w-5 h-5 text-primary mx-auto" />
              <p className="text-2xl font-bold mt-2">{stats.totalMeasurements}</p>
              <p className="text-xs text-muted-foreground">Measurements</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-4">{getMetricLabel(selectedMetric)} Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    formatter={(value: number) => [
                      `${value.toFixed(1)} ${getMetricUnit(selectedMetric)}`,
                      getMetricLabel(selectedMetric),
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={getMetricLabel(selectedMetric)}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {chartData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No data available for {getMetricLabel(selectedMetric)}.
          </p>
        </div>
      )}
    </div>
  );
}

