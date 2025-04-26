
export const InputText = (props: {
  value: string,
  onChange: (value: string) => void,
  disabled?: boolean,
}) => {
  return (
    <div className="flex w-full flex-col">
      <input
        value={props.value}
        disabled={props.disabled}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  )
}
