import { ChangeEvent, useState, useContext, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPinLine,
  CurrencyDollar,
  CreditCard,
  Bank,
  Money,
  Trash,
} from 'phosphor-react'

import { LocationContext } from '../../contexts/location'
import { CartContext } from '../../contexts/cart'

import { PaymentTypes } from '../../lib/payments'
import {
  postalCodeRegexValidation,
  postalCodeMaxCharacters,
} from '../../lib/cities'

import { defaultTheme } from '../../styles/themes/default'
import { ItemQuantitySelector } from '../CoffeCard/style'

import {
  FormSession,
  InputsGroup,
  GenericInput,
  FormContainer,
  SubmitFormButton,
  PaymentType,
  PaymentTypesContainer,
  SelectedProduct,
  RemoveProductButton,
  CartTotal,
} from './style'

export const maxItemQuantityOnCart = 10
const fixedDeliveryFee = 3.5

const newOrderFormSchema = z.object({
  address: z.object({
    postalCode: z
      .string()
      .nonempty('Required.')
      .length(
        postalCodeMaxCharacters,
        'Enter a six-character postal code without spaces, e.g. K1A0T6',
      )
      .regex(
        postalCodeRegexValidation,
        'Enter a valid postal code, e.g. K1A0T6.',
      )
      .toUpperCase(),
    line1: z.string().nonempty('Required.'),
    line2: z.string(),
    province: z.string().nonempty('Required.'),
    city: z.string().nonempty('Required.'),
  }),
  payment: z.object({
    type: z.string().nonempty('Required.'),
    additionalInfo: z.string().trim(),
  }),
  cart: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.coerce
          .number()
          .min(1, `Minimum of 1 unit per product.`)
          .max(
            maxItemQuantityOnCart,
            `Maximum of ${maxItemQuantityOnCart} units per product.`,
          )
          .positive('Please add the product quantity.'),
        product: z.object({
          id: z.string().uuid(),
          price: z.coerce.number(),
        }),
      }),
    )
    .nonempty('Cart is empty.'),
})

type newOrderFormData = z.infer<typeof newOrderFormSchema>

export function NewOrderForm() {
  const [quantity, setQuantity] = useState<number>(0)
  const [paymentType, setPaymentType] = useState<string | undefined>(
    PaymentTypes.CREDIT_CARD,
  )

  const { selectedCity, selectedProvince } = useContext(LocationContext)
  const { items } = useContext(CartContext)

  const {
    setValue,
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<newOrderFormData>({
    resolver: zodResolver(newOrderFormSchema),
    defaultValues: {
      address: {
        city: selectedCity.name,
        province: selectedProvince.abbreviation,
      },
      payment: {
        type: PaymentTypes.CREDIT_CARD,
      },
      cart: items.length ? items : [],
    },
  })

  watch((data, { name }) => {
    if (data.payment?.type && name === 'payment.type') {
      setPaymentType(data.payment.type)
    }
  })

  useEffect(() => {
    setValue('address.city', selectedCity.name)
    setValue('address.province', selectedProvince.name)
  }, [selectedCity, selectedProvince, setValue])

  function placeOrder(data: any) {
    // TODO - Go to Order Status page
    console.log(data)
  }

  function calculateCartTotalItems(): number {
    let cartTotalItems = 0
    if (!items.length) return cartTotalItems

    items.forEach(
      (item) =>
        (cartTotalItems = cartTotalItems + item.quantity * item.product.price),
    )
    return cartTotalItems
  }

  function calculateCartTotal(): number {
    const totalItems = Number(calculateCartTotalItems())
    return totalItems + fixedDeliveryFee
  }

  function handleQuantityIncrease() {
    setQuantity((quantity) => quantity + 1)
  }

  function handleQuantityDecrease() {
    if (!quantity) return
    setQuantity((quantity) => quantity - 1)
  }

  function handleQuantityChange(event: ChangeEvent<HTMLInputElement>) {
    setQuantity(Number(event.target.value))
  }

  return (
    <FormContainer onSubmit={handleSubmit(placeOrder)}>
      <div className="grid-1st-column">
        <span>Complete your order</span>

        <FormSession>
          <div className="session-header">
            <MapPinLine size={22} color={defaultTheme.yellowDark} />
            <span className="session-header__title">Your address</span>
          </div>

          <InputsGroup>
            <GenericInput>
              <input
                type="text"
                placeholder="Postal code"
                {...register('address.postalCode')}
              />
              {errors.address?.postalCode && (
                <span className="input-error__message">
                  {errors.address.postalCode.message}
                </span>
              )}
            </GenericInput>
            <GenericInput>
              <input
                type="text"
                placeholder="Address Line 1"
                {...register('address.line1')}
              />
              {errors.address?.line1 && (
                <span className="input-error__message">
                  {errors.address.line1.message}
                </span>
              )}
            </GenericInput>
            <GenericInput>
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                {...register('address.line2')}
              />
            </GenericInput>
            <GenericInput>
              <input
                type="text"
                {...register('address.city')}
                placeholder="Select a City..."
                disabled
              />
              {errors.address?.city && (
                <span className="input-error__message">
                  {errors.address.city.message}
                </span>
              )}
            </GenericInput>
            <GenericInput>
              <input
                type="text"
                {...register('address.province')}
                placeholder="Select a Province..."
                disabled
              />
              {errors.address?.province && (
                <span className="input-error__message">
                  {errors.address.province.message}
                </span>
              )}
            </GenericInput>
          </InputsGroup>
        </FormSession>

        <FormSession>
          <div className="session-header">
            <CurrencyDollar size={22} color={defaultTheme.yellowDark} />
            <div className="session-header__wrapper">
              <span className="session-header__title">Payment</span>
              <span className="session-header__message">
                Payment is processed at delivery. Choose the way you want to
                pay:
              </span>
            </div>
          </div>

          <PaymentTypesContainer>
            <PaymentType>
              <input
                id="credit-card"
                type="radio"
                value={PaymentTypes.CREDIT_CARD}
                {...register('payment.type')}
              />
              <label
                htmlFor="credit-card"
                className={paymentType === '0' ? 'selected' : ''}
                title="Payment is credit card."
              >
                <CreditCard color={defaultTheme.purple} size={16} />
                Credit Card
              </label>
            </PaymentType>

            <PaymentType>
              <input
                id="debit-card"
                type="radio"
                value={PaymentTypes.DEBIT_CARD}
                {...register('payment.type')}
              />
              <label
                htmlFor="debit-card"
                className={paymentType === '1' ? 'selected' : ''}
                title="Payment is debit card."
              >
                <Bank color={defaultTheme.purple} size={16} />
                Debit Card
              </label>
            </PaymentType>

            <PaymentType>
              <input
                id="cash"
                type="radio"
                value={PaymentTypes.CASH}
                {...register('payment.type')}
              />
              <label
                htmlFor="cash"
                className={paymentType === '2' ? 'selected' : ''}
                title="Payment is cash."
              >
                <Money color={defaultTheme.purple} size={16} />
                Cash
              </label>
            </PaymentType>
          </PaymentTypesContainer>

          <GenericInput>
            <label htmlFor="additional-info">Additional info:</label>

            <textarea
              id="additional-info"
              {...register('payment.additionalInfo')}
              placeholder="If needed, add instructions for our delivery or payment."
            />
          </GenericInput>
        </FormSession>
      </div>

      <div className="grid-2nd-column">
        <span>Selected items</span>

        <FormSession>
          {items.length
            ? items.map((item, index) => {
                return (
                  <SelectedProduct key={item.id}>
                    <img
                      src={item.product.imgUrl}
                      alt={item.product.imgAltText}
                    />

                    <div className="product__info">
                      <span className="product__title">
                        {item.product.name}
                      </span>
                      <div className="product__actions">
                        <ItemQuantitySelector>
                          <span
                            onClick={handleQuantityDecrease}
                            title="Decrease quantity"
                          >
                            -
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={maxItemQuantityOnCart}
                            {...register(`cart.${index}.quantity`)}
                            onChange={handleQuantityChange}
                          />
                          <span
                            onClick={handleQuantityIncrease}
                            title="Increase quantity"
                          >
                            +
                          </span>
                        </ItemQuantitySelector>
                        <RemoveProductButton
                          title="Remove product from cart"
                          type="button"
                        >
                          <Trash
                            size={16}
                            weight="fill"
                            className="trash-icon"
                          />
                          <span>Remove</span>
                        </RemoveProductButton>
                      </div>
                    </div>

                    <span className="product__price">
                      CAD {Number(item.product.price).toFixed(2)}
                    </span>
                  </SelectedProduct>
                )
              })
            : null}

          <CartTotal>
            <div className="products-total">
              <span>Total items</span>
              <span>
                CAD{' '}
                {items.length ? calculateCartTotalItems().toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="delivery-total">
              <span>Delivery</span>
              <span>
                CAD {items.length ? fixedDeliveryFee.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="order-total">
              <span>Total</span>
              <span>
                CAD {items.length ? calculateCartTotal().toFixed(2) : '0.00'}
              </span>
            </div>
          </CartTotal>

          {errors.cart?.message && (
            <span className="input-error__message">{errors.cart.message}</span>
          )}
          <SubmitFormButton type="submit">Place your order</SubmitFormButton>
        </FormSession>
      </div>
    </FormContainer>
  )
}
