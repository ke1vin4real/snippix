import { useCallback } from 'react';

interface Props {
  onChange: (value: WindowType) => void;
}

export default function WindowTypeSelection({ onChange }: Props) {
  const handleChange = useCallback(
    (e: React.ChangeEvent) => {
      const { value } = e.currentTarget as HTMLSelectElement;
      onChange(value as WindowType);
    },
    [onChange]
  );

  return (
    <select onChange={handleChange}>
      <option value="WINDOWS">Windows</option>
      <option value="MAC">Mac</option>
      <option value="UBUNTU">Ubuntu</option>
      <option value="NONE">None</option>
    </select>
  );
}
