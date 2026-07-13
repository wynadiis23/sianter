import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/id'

dayjs.extend(utc)
dayjs.locale('id')

export const wita = (date?: dayjs.ConfigType) => dayjs(date).utcOffset(480)
export { dayjs }
