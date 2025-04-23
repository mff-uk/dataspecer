
export const InputText = (props: {
  value: string,
  onChange: (value: string) => void,
}) => {
  return (
    <div className="flex w-full flex-col">
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  )
}
