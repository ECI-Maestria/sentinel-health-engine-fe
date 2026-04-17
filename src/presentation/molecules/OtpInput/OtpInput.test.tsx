import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OtpInput } from './OtpInput'

describe('OtpInput', () => {
  it('renders 6 inputs', () => {
    render(<OtpInput value="" onChange={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(6)
  })

  it('displays current value digits in respective inputs', () => {
    render(<OtpInput value="123456" onChange={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    expect(inputs[0].value).toBe('1')
    expect(inputs[1].value).toBe('2')
    expect(inputs[5].value).toBe('6')
  })

  it('calls onChange when typing a digit', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<OtpInput value="" onChange={onChange} />)
    const inputs = screen.getAllByRole('textbox')
    await user.type(inputs[0], '5')
    expect(onChange).toHaveBeenCalledWith('5     '.slice(0, 6))
  })

  it('focuses previous input on Backspace when current is empty', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<OtpInput value="12    " onChange={onChange} />)
    const inputs = screen.getAllByRole('textbox')
    inputs[2].focus()
    await user.keyboard('{Backspace}')
    expect(document.activeElement).toBe(inputs[1])
  })

  it('disables all inputs when disabled prop is true', () => {
    render(<OtpInput value="" onChange={vi.fn()} disabled />)
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    inputs.forEach((input) => expect(input).toBeDisabled())
  })
})
