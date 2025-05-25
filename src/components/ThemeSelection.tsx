import { type THEME } from '@/configs/theme-list';
import { type ChangeEvent } from 'react';

interface Props {
  list: THEME[];
  onChange: (value: string) => void;
}

export default function ThemeSelection({ list, onChange }: Props) {
  const handleChange = (e: ChangeEvent) => {
    const { value } = e.currentTarget as HTMLSelectElement;
    onChange(value);
  };
  return (
    <select onChange={handleChange}>
      {list.map(({ name, key }) => (
        <option key={key} value={key}>
          {name}
        </option>
      ))}
    </select>
  );
}
