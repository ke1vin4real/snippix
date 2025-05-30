import { useCallback } from 'react';

interface Props {
  onChange: (value: string) => void;
}

export default function WindowDarkSelection({ onChange }: Props) {
  const handleChange = useCallback(
    (e: React.ChangeEvent) => {
      const { value } = e.currentTarget as HTMLSelectElement;
      onChange(value);
    },
    [onChange]
  );

  return (
    <select onChange={handleChange}>
      <option value="true">yes</option>
      <option value="false">no</option>
    </select>
  );
}
