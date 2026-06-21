export function formatearMoneda(valor) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    }).format(valor);
}

export function formatearNumero(valor) {
    return new Intl.NumberFormat("es-MX").format(valor);
}