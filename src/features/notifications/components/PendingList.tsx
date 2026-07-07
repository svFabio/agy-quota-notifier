import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { NotificationRecord } from '../../../core/database/database';
import { COLORS } from '../../../core/constants/theme';
import { Text } from '../../../components/ui/Text';

// Componente inteligente para manejar el tiempo real de cada ítem
function CountdownItem({ item }: { item: NotificationRecord }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Si la data guardada es de una versión vieja (ej. "14:30"), fallará,
    // por lo que intentamos leer el nuevo formato ISO string.
    const targetTimestamp = new Date(item.dateScheduled).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTimestamp - now;

      if (isNaN(diff)) {
        setTimeLeft('--:--:--');
        setIsFinished(true);
        return;
      }

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setIsFinished(true);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [item.dateScheduled]);

  // Si tiene tiempo restante, se muestra rojo (error), si no, azul (primary)
  const dynamicColor = isFinished ? COLORS.primary : COLORS.error;

  const targetDateObj = new Date(item.dateScheduled);
  const targetTimeStr = isNaN(targetDateObj.getTime()) 
    ? item.dateScheduled // fallback viejo
    : targetDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.listItem, { borderLeftColor: dynamicColor }]}>
      <Text weight="bold" style={styles.itemTitle}>{item.name}</Text>
      <Text style={styles.itemSubtitle}>
        Sonará a las: {targetTimeStr}
      </Text>
      <Text weight="bold" style={[styles.countdown, { color: dynamicColor }]}>
        {isFinished ? '¡Tokens listos!' : `Faltan: ${timeLeft}`}
      </Text>
    </View>
  );
}

interface PendingListProps {
  notifications: NotificationRecord[];
}

export function PendingList({ notifications }: PendingListProps) {
  const renderItem = ({ item }: { item: NotificationRecord }) => (
    <CountdownItem item={item} />
  );

  return (
    <>
      <Text weight="bold" style={styles.listHeader}>Avisos Pendientes Activos</Text>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No hay avisos programados.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  listHeader: {
    fontSize: 18,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  listItem: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 5,
    elevation: 1,
  },
  itemTitle: {
    fontSize: 16,
  },
  itemSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  countdown: {
    fontSize: 16,
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 20,
    fontStyle: 'italic',
  },
});
