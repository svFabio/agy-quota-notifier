import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { NotificationRecord } from '../repositories/notifications.repository';
import { useTheme, SIZES, FONTS } from '../../../core/constants/theme';
import { Text, OptionsModal } from '../../../components/ui';
import { TouchableOpacity } from 'react-native';
import { speak } from '../../../core/services/speech.service';

// Componente inteligente para manejar el tiempo real de cada ítem
function CountdownItem({ item, onEdit, onDelete, onFinished }: { 
  item: NotificationRecord, 
  onEdit: (i: NotificationRecord) => void, 
  onDelete: (id: string) => void,
  onFinished: (name: string) => void
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const hasNotified = useRef(false);
  const { colors } = useTheme();

  useEffect(() => {
    // Si la data guardada es de una versión vieja (ej. "14:30"), fallará,
    // por lo que intentamos leer el nuevo formato ISO string.
    const targetTimestamp = new Date(item.dateScheduled).getTime();
    const startTimestamp = targetTimestamp - (item.hours * 3600000);

    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTimestamp - now;
      const total = targetTimestamp - startTimestamp;

      if (isNaN(diff)) {
        setTimeLeft('--:--:--');
        setIsFinished(true);
        setProgress(0);
        return;
      }

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setIsFinished(true);
        setProgress(100);
        // Notificar al padre UNA SOLA VEZ, y solo si terminó hace menos de 10 segundos
        // Esto evita que hable al abrir la app con cuentas ya vencidas hace rato
        if (!hasNotified.current && diff > -10000) {
          hasNotified.current = true;
          onFinished(item.name.split('@')[0]);
        }
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      
      const p = Math.max(0, Math.min(100, ((now - startTimestamp) / total) * 100));
      setProgress(p);
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
          {item.browser || item.model ? (
            <Text style={[styles.browserTag, { color: colors.accent }]}>
              {item.browser && `Navegador: ${item.browser}`}
              {item.browser && item.model && ' | '}
              {item.model && `Modelo: ${item.model}`}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.optionsBtn} onPress={() => setModalVisible(true)}>
          <Text weight="bold" style={[styles.optionsText, { color: colors.textMuted }]}>•••</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemFooter}>
        <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>
          Sonará a las: {targetTimeStr}
        </Text>
        <Text weight="bold" style={[styles.countdown, { color: dynamicColor }]}>
          {isFinished ? 'Tokens listos' : `Faltan: ${timeLeft}`}
        </Text>
      </View>

      <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { backgroundColor: dynamicColor, width: `${progress}%` }]} />
      </View>

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
  
  // Cola de cuentas terminadas para hablar de forma agrupada
  const speechQueue = useRef<string[]>([]);
  const speechTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFinished = (name: string) => {
    speechQueue.current.push(name);
    if (speechTimer.current) clearTimeout(speechTimer.current);
    speechTimer.current = setTimeout(() => {
      const names = speechQueue.current;
      speechQueue.current = [];
      if (names.length === 1) {
        speak(`Señor, los tokens de la cuenta ${names[0]} están listos.`);
      } else if (names.length > 1) {
        speak(`Atención Señor. ${names.length} cuentas tienen los tokens listos simultáneamente.`);
      }
    }, 500);
  };

  const renderItem = ({ item }: { item: NotificationRecord }) => (
    <CountdownItem item={item} onEdit={onEdit} onDelete={onDelete} onFinished={handleFinished} />
  );

  // Ordenar: los que tienen el tiempo más viejo (o ya terminados) van primero.
  const sortedNotifications = [...notifications].sort((a, b) => {
    const timeA = new Date(a.dateScheduled).getTime();
    const timeB = new Date(b.dateScheduled).getTime();
    return timeA - timeB;
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
    fontSize: SIZES.h4,
    marginBottom: SIZES.base,
  },
  list: {
    flex: 1,
  },
  listItem: {
    padding: SIZES.medium,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
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
    paddingRight: SIZES.base,
  },
  itemTitle: {
    fontSize: SIZES.h3,
    marginBottom: SIZES.base / 2,
  },
  browserTag: {
    fontSize: SIZES.smallText,
    marginTop: SIZES.base / 4,
    fontFamily: FONTS.semiBold,
  },
  optionsBtn: {
    padding: SIZES.base / 2,
  },
  optionsText: {
    fontSize: SIZES.h4,
    letterSpacing: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: SIZES.base,
  },
  itemSubtitle: {
    fontSize: SIZES.smallText,
  },
  countdown: {
    fontSize: SIZES.smallText,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SIZES.large,
    fontStyle: 'italic',
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    marginTop: SIZES.base,
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
