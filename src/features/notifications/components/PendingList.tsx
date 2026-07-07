import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { NotificationRecord } from '../../../core/database/database';
import { useTheme } from '../../../core/constants/theme';
import { Text } from '../../../components/ui/Text';
import { OptionsModal } from '../../../components/ui/OptionsModal';
import { TouchableOpacity } from 'react-native';

// Componente inteligente para manejar el tiempo real de cada ítem
function CountdownItem({ item, onEdit, onDelete }: { item: NotificationRecord, onEdit: (i: NotificationRecord) => void, onDelete: (id: string) => void }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { colors } = useTheme();

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
  const dynamicColor = isFinished ? colors.primary : colors.error;

  const targetDateObj = new Date(item.dateScheduled);
  const targetTimeStr = isNaN(targetDateObj.getTime()) 
    ? item.dateScheduled // fallback viejo
    : targetDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.listItem, { backgroundColor: colors.surface, borderLeftColor: dynamicColor }]}>
      <View style={styles.itemHeader}>
        <View style={styles.titleContainer}>
          <Text weight="bold" style={styles.itemTitle}>{item.name}</Text>
          {item.browser ? (
            <Text style={[styles.browserTag, { color: colors.primary }]}>Navegador: {item.browser}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.optionsBtn} onPress={() => setModalVisible(true)}>
          <Text weight="bold" style={[styles.optionsText, { color: colors.textMuted }]}>•••</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>
        Sonará a las: {targetTimeStr}
      </Text>
      <Text weight="bold" style={[styles.countdown, { color: dynamicColor }]}>
        {isFinished ? '¡Tokens listos!' : `Faltan: ${timeLeft}`}
      </Text>

      <OptionsModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onEdit={() => { setModalVisible(false); onEdit(item); }}
        onDelete={() => { setModalVisible(false); onDelete(item.id); }}
      />
    </View>
  );
}

interface PendingListProps {
  notifications: NotificationRecord[];
  onEdit: (item: NotificationRecord) => void;
  onDelete: (id: string) => void;
}

export function PendingList({ notifications, onEdit, onDelete }: PendingListProps) {
  const { colors } = useTheme();
  
  const renderItem = ({ item }: { item: NotificationRecord }) => (
    <CountdownItem item={item} onEdit={onEdit} onDelete={onDelete} />
  );

  // Ordenar: los que tienen el tiempo más viejo (o ya terminados) van primero.
  const sortedNotifications = [...notifications].sort((a, b) => {
    const timeA = new Date(a.dateScheduled).getTime();
    const timeB = new Date(b.dateScheduled).getTime();
    return timeA - timeB; // Menor tiempo = termina antes (o ya terminó)
  });

  return (
    <>
      <Text weight="bold" style={styles.listHeader}>Avisos Pendientes Activos</Text>
      {sortedNotifications.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay avisos programados.</Text>
      ) : (
        <FlatList
          data={sortedNotifications}
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
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 5,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    fontSize: 16,
  },
  browserTag: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  optionsBtn: {
    padding: 5,
  },
  optionsText: {
    fontSize: 18,
    letterSpacing: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  countdown: {
    fontSize: 16,
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
