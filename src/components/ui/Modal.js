'use client'

import { IconX } from '@/components/icons'

export default function Modal({ title, onClose, children, footer, maxWidth }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Fechar">
            <IconX size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
