'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InputField = ({ label, error, ...props }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{label}</Label>
      <Input {...props} className={error ? 'border-red-500' : ''} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default InputField