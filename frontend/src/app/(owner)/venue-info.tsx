import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { SettingsPage } from '@/components/venue/SettingsPage';
import { VenueInfoForm } from '@/components/venue/VenueInfoForm';
import { OwnerText } from '@/components/ui/owner-ui';
import { venueRepository } from '@/data/repositories/venueRepository';
import {
  createEmptyOwnerSetupVenueInfo,
  type OwnerSetupVenueInfo,
} from '@/features/venue/ownerSetupContext';
import { useOwnerVenueAccess } from '@/features/venue/useOwnerVenueAccess';
import type { Venue } from '@/models/venue';

function toVenueInfo(venue: Venue): OwnerSetupVenueInfo {
  return {
    name: venue.name,
    address: venue.address,
    district: venue.district,
    city: venue.city,
    phone: venue.phone ?? '',
    description: venue.description ?? '',
    coverImageUrl: venue.coverImageUrl ?? '',
    amenityIds: venue.amenities?.map(({ id }) => id) ?? [],
  };
}

export default function VenueInfoPage() {
  const router = useRouter();
  const { primaryVenue, loading: accessLoading, error: accessError, refresh: refreshAccess } = useOwnerVenueAccess();
  const primaryVenueId = primaryVenue?.id ?? null;
  const cachedVenue = primaryVenueId === null ? null : venueRepository.getCached(primaryVenueId);
  const [venue, setVenue] = useState<OwnerSetupVenueInfo>(() =>
    cachedVenue ? toVenueInfo(cachedVenue) : createEmptyOwnerSetupVenueInfo(),
  );
  const [savedVenue, setSavedVenue] = useState<OwnerSetupVenueInfo | null>(() =>
    cachedVenue ? toVenueInfo(cachedVenue) : null,
  );
  const [venueId, setVenueId] = useState<number | null>(cachedVenue?.id ?? null);
  const [loading, setLoading] = useState(cachedVenue === null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active || accessLoading) return;
      if (accessError) {
        setError(accessError);
        setLoading(false);
        return;
      }
      if (primaryVenueId === null) {
        setError('Không tìm thấy thông tin sân của tài khoản này.');
        setLoading(false);
        return;
      }

      const previous = venueRepository.getCached(primaryVenueId);
      if (previous) {
        setVenueId(previous.id);
        const previousInfo = toVenueInfo(previous);
        setVenue(previousInfo);
        setSavedVenue(previousInfo);
      }
      setLoading(previous === null);
      setError('');
      void venueRepository
        .get(primaryVenueId)
        .then((item) => {
          if (!active) return;
          setVenueId(item.id);
          const nextVenue = toVenueInfo(item);
          setVenue(nextVenue);
          setSavedVenue(nextVenue);
        })
        .catch((e) => {
          if (active && previous === null) {
            setError(e instanceof Error ? e.message : 'Không tải được thông tin sân.');
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [accessError, accessLoading, primaryVenueId]);

  const save = async () => {
    if (venueId === null) return;
    setSaving(true);
    setError('');
    try {
      const updated = await venueRepository.update(venueId, {
        name: venue.name.trim(),
        address: venue.address.trim(),
        district: venue.district.trim(),
        city: venue.city.trim(),
        phone: venue.phone.trim() || null,
        description: venue.description.trim() || null,
        coverImageUrl: venue.coverImageUrl.trim() || null,
        amenityIds: venue.amenityIds,
      });
      const nextVenue = toVenueInfo(updated);
      setVenue(nextVenue);
      setSavedVenue(nextVenue);
      if (primaryVenue?.status === 'rejected') {
        await venueRepository.resubmit(venueId);
        await refreshAccess();
        router.replace('/owner-setup/pending');
      } else {
        Alert.alert('Đã lưu', 'Thông tin sân đã được cập nhật.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể lưu thông tin sân. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = savedVenue !== null && JSON.stringify(venue) !== JSON.stringify(savedVenue);

  return (
    <SettingsPage
      title="Thông tin sân"
      saveTitle={
        loading
          ? 'Đang tải...'
          : saving
            ? 'Đang lưu...'
            : primaryVenue?.status === 'rejected'
              ? 'Lưu & gửi duyệt lại'
              : 'Lưu thay đổi'
      }
      disabled={loading || saving || venueId === null}
      showSave={hasChanges || saving}
      onBack={() => {
        if (router.canGoBack()) router.back();
        else if (primaryVenue?.status === 'rejected') router.replace('/owner-setup/pending');
        else router.replace('/(owner)/dashboard');
      }}
      onSave={() => void save()}
    >
      {loading ? (
        <View className="items-center py-8">
          <ActivityIndicator />
        </View>
      ) : venueId !== null ? (
        <VenueInfoForm value={venue} onChange={(patch) => setVenue((prev) => ({ ...prev, ...patch }))} />
      ) : null}
      {error ? <OwnerText tone="muted" className="text-caption">{error}</OwnerText> : null}
    </SettingsPage>
  );
}
