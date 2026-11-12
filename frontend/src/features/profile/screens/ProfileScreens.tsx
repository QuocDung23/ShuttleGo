import { useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { OwnerButton, OwnerCard, OwnerChip, OwnerHeader, OwnerInput, OwnerPage, OwnerText, ownerColors } from '@/shared/components/owner-ui';

export function AccountScreen() {
  const router = useRouter();
  const menu = [
    [{ios:'building.2',android:'sports_tennis',web:'sports_tennis'}, 'Thông tin sân', '/venue-info'],
    [{ios:'tag',android:'sell',web:'sell'}, 'Giá theo khung giờ', '/pricing'],
    [{ios:'clock',android:'schedule',web:'schedule'}, 'Giờ mở cửa', '/hours'],
    [{ios:'bell',android:'notifications',web:'notifications'}, 'Thông báo', '/notifications'],
  ] as const;
  return <OwnerPage>
    <OwnerText size={24} weight="bold" style={{ marginTop: 40, marginBottom: 6 }}>Tài khoản</OwnerText>
    <View style={styles.profile}><View style={styles.avatar}><OwnerText size={20} weight="semibold" color="#4a1a05">HL</OwnerText></View><View><OwnerText size={16} weight="semibold">Hoàng Lan</OwnerText><OwnerText color={ownerColors.muted}>Chủ sân · Sân cầu lông Kỳ Hòa</OwnerText></View></View>
    <OwnerCard style={{ paddingVertical: 4, gap: 0 }}>{menu.map(([icon,title,path]) => <Pressable key={title} onPress={() => router.push(path)} style={styles.menuRow}><SymbolView name={icon} size={22} tintColor={ownerColors.muted} /><OwnerText size={16} style={{ flex: 1 }}>{title}</OwnerText><OwnerText size={20} color={ownerColors.muted}>›</OwnerText></Pressable>)}</OwnerCard>
    <OwnerButton title="Đăng xuất" outline onPress={() => Alert.alert('Đăng xuất', 'Bạn đã đăng xuất.')} style={{ marginTop: 10 }} />
  </OwnerPage>;
}

const notifications = [
  ['Đơn mới chờ duyệt', 'Phạm Gia Huy · Sân 1 · T2, 02/11 · 20:00 – 22:00', '15 phút trước'],
  ['Đơn mới chờ duyệt', 'Lê Thu Hà · Sân 4 · CN, 01/11 · 18:00 – 19:00 · Đã thanh toán', '1 giờ trước'],
  ['Đơn mới chờ duyệt', 'Trần Quốc Bảo · Sân 2 · T7, 31/10 · 19:00 – 21:00', '2 giờ trước'],
  ['Người chơi đã hủy đơn', 'Khung giờ T5, 29/10 · 18:00 – 19:00 tại Sân 3 đã được mở lại.', '2 ngày trước'],
];

export function NotificationsScreen() {
  const router=useRouter();
  const [unread, setUnread] = useState([true,true,true,false]);
  return <OwnerPage scroll={false}>
    <OwnerHeader title="Thông báo" back onBack={() => router.back()} right={<Pressable accessibilityLabel="Đánh dấu tất cả đã đọc" onPress={() => setUnread([false,false,false,false])}><OwnerText size={20} color={ownerColors.muted}>✓</OwnerText></Pressable>} />
    <ScrollView>
      {notifications.map(([title,desc,ago],i) => <Pressable key={i} onPress={() => setUnread(unread.map((value,n) => n === i ? false : value))} style={[styles.notice,{backgroundColor:unread[i] ? '#fff' : ownerColors.page}]}><View style={styles.noticeIcon}><OwnerText size={20} color="#4a1a05">{i === 3 ? '↶' : '▣'}</OwnerText></View><View style={{ flex: 1, gap: 3 }}><View style={styles.noticeTitle}><OwnerText weight="semibold" size={16}>{title}</OwnerText>{unread[i] && <View style={styles.unreadDot} />}</View><OwnerText color={ownerColors.muted} style={{ lineHeight: 20 }}>{desc}</OwnerText><OwnerText size={12} color={ownerColors.muted}>{ago}</OwnerText></View></Pressable>)}
    </ScrollView>
  </OwnerPage>;
}

export function VenueInfoScreen() {
  return <SettingsPage title="Thông tin sân" save="Lưu thay đổi">
    <View style={styles.photo}><OwnerText size={12} weight="semibold" color="#4a1a05">Ảnh bìa sân · tỉ lệ 16:7</OwnerText></View>
    <OwnerButton title="Thêm ảnh" outline />
    <OwnerInput label="Tên sân" defaultValue="Sân cầu lông Kỳ Hòa" />
    <OwnerInput label="Địa chỉ" defaultValue="238 Bis Ba Tháng Hai, Phường 12, Quận 10" />
    <OwnerInput label="Số điện thoại liên hệ" defaultValue="0912 345 678" keyboardType="phone-pad" />
    <OwnerInput label="Mô tả ngắn" defaultValue="Sân thảm PVC, đèn LED chống chói, trần cao" />
    <View style={styles.separator} /><OwnerText weight="semibold">Tiện ích</OwnerText><View style={styles.chips}><OwnerChip title="Gửi xe" selected /><OwnerChip title="Phòng thay đồ" selected /></View>
  </SettingsPage>;
}

export function PricingScreen() {
  const [prices,setPrices] = useState([80000,120000,170000,10000]);
  const change=(i:number,delta:number)=>setPrices(prices.map((v,n)=>n===i?Math.max(0,v+delta):v));
  const rows=[['Giờ thường','06:00 – 17:00'],['Giờ cao điểm','17:00 – 22:00'],['Bắt đầu cao điểm','Áp dụng giá cao điểm từ giờ này'],['Phụ thu cuối tuần','Cộng thêm mỗi giờ vào T7, CN']];
  const money=(n:number)=>`${n.toLocaleString('vi-VN')}đ`;
  return <SettingsPage title="Giá theo khung giờ" save="Lưu giá"><OwnerText color={ownerColors.muted} size={16} style={{lineHeight:24}}>Giá tính cho mỗi giờ trên một sân. Người chơi thấy giá này khi chọn giờ.</OwnerText>
    <View style={styles.priceCard}>{rows.map(([label,desc],i)=><View key={label} style={styles.priceRow}><View style={{flex:1}}><OwnerText weight="semibold">{label}</OwnerText><OwnerText size={12} color={ownerColors.muted}>{desc}</OwnerText></View><Pressable onPress={()=>change(i,-10000)} style={styles.stepper}><OwnerText size={22}>−</OwnerText></Pressable><OwnerText weight="semibold" style={{width:82,textAlign:'center'}}>{i===2?'17:00':money(prices[i])}</OwnerText><Pressable onPress={()=>change(i,10000)} style={styles.stepper}><OwnerText size={22}>+</OwnerText></Pressable></View>)}</View>
    <OwnerText weight="semibold">Người chơi sẽ thấy</OwnerText><View style={styles.preview}>{[['06:00','80k'],['16:00','80k'],['17:00','120k'],['21:00','120k']].map(([time,price])=><View key={time} style={styles.previewCell}><OwnerText weight="semibold" color={ownerColors.greenInk}>{time}</OwnerText><OwnerText size={11} weight="semibold" color={ownerColors.greenInk}>{price}</OwnerText></View>)}</View><OwnerText size={11} color={ownerColors.muted}>Ngày thường. Cuối tuần: 90.000đ giờ thường, 130.000đ giờ cao điểm.</OwnerText>
  </SettingsPage>;
}

export function HoursScreen() {
  return <SettingsPage title="Giờ mở cửa" save="Lưu giờ mở cửa"><OwnerText color={ownerColors.muted}>Thiết lập giờ hoạt động của sân</OwnerText>{['Thứ 2 – Thứ 6','Thứ 7','Chủ nhật'].map((day,i)=><OwnerCard key={day} style={styles.hoursRow}><OwnerText weight="semibold">{day}</OwnerText><OwnerText>06:00 – 22:00</OwnerText><OwnerChip title={i===0?'Mở cửa':'Mở cửa'} selected /></OwnerCard>)}</SettingsPage>;
}

function SettingsPage({title,save,children}:{title:string;save:string;children:ReactNode}) {
  const router=useRouter();
  return <OwnerPage scroll={false}><OwnerHeader title={title} back onBack={() => router.back()} /><ScrollView contentContainerStyle={styles.settings}>{children}</ScrollView><View style={styles.saveBar}><OwnerButton title={save} onPress={() => Alert.alert('Đã lưu', 'Thay đổi của bạn đã được lưu.')} /></View></OwnerPage>;
}

const styles=StyleSheet.create({
  profile:{flexDirection:'row',alignItems:'center',gap:16,marginVertical:6},
  avatar:{width:56,height:56,borderRadius:28,backgroundColor:ownerColors.accentSoft,alignItems:'center',justifyContent:'center'},
  menuRow:{height:56,flexDirection:'row',alignItems:'center',gap:18,paddingHorizontal:16},
  notice:{minHeight:107,padding:16,flexDirection:'row',gap:12,borderBottomWidth:1,borderBottomColor:ownerColors.border},
  noticeIcon:{width:40,height:40,borderRadius:20,backgroundColor:ownerColors.accentSoft,alignItems:'center',justifyContent:'center'},
  noticeTitle:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  unreadDot:{width:8,height:8,borderRadius:4,backgroundColor:ownerColors.accent},
  photo:{height:156,borderRadius:16,backgroundColor:ownerColors.accentSoft,alignItems:'center',justifyContent:'center'},
  separator:{height:1,backgroundColor:ownerColors.border,marginVertical:10},
  chips:{flexDirection:'row',gap:8},
  settings:{paddingHorizontal:16,paddingTop:8,paddingBottom:18,gap:14,width:'100%',maxWidth:640,alignSelf:'center'},
  saveBar:{paddingHorizontal:16,paddingTop:12,paddingBottom:14,borderTopWidth:1,borderColor:ownerColors.border,backgroundColor:ownerColors.page},
  priceCard:{backgroundColor:'#fff',borderColor:ownerColors.border,borderWidth:1,borderRadius:24,overflow:'hidden'},
  priceRow:{minHeight:72,paddingHorizontal:14,borderBottomWidth:1,borderBottomColor:ownerColors.border,flexDirection:'row',alignItems:'center',gap:8},
  stepper:{height:48,width:48,borderRadius:24,borderWidth:1,borderColor:ownerColors.stroke,alignItems:'center',justifyContent:'center'},
  preview:{flexDirection:'row',gap:8},
  previewCell:{flex:1,minHeight:56,borderRadius:12,borderColor:'#15803d',borderWidth:1,backgroundColor:ownerColors.green,alignItems:'center',justifyContent:'center',gap:2},
  hoursRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
});
