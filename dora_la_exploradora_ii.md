# 1.5.4. Dora la exploradora II

**Nombre original:** Dora the Explorer II¹³  
**Fuente:** Maratón de Programación UFPS¹⁴ 2019  
**Fecha:** 8 de Junio de 2019  
**Autor:** Hugo Humberto Morales Peña  

---

Un día, una hormiga llamada Dora la Exploradora llegó a un tablero triangular de $d$ diagonales. Como quería explorar todas las casillas del tablero, comenzó a caminar por el mismo desde la diagonal que tiene una sola casilla.

Dora la Exploradora comenzó en la casilla $(1, 1)$. En primer lugar, dio un paso adelante quedando en la casilla $(1, 2)$, luego, descendió por la diagonal quedando en la casilla $(2, 1)$, después, dio un paso a la derecha quedando en la casilla $(3, 1)$, posteriormente, ascendió por la diagonal recorriendo las casillas $(2, 2)$ y $(1, 3)$. Cada vez añadía una nueva diagonal al recorrido, en ascenso o en descenso, dependiendo de la primera casilla a la que llegara de la diagonal.

Por ejemplo, en 15 pasos hizo el recorrido de la **Figura 1.23** en el tablero triangular, donde el número de cada casilla indica el orden en que la visitó.

```text
  5 │  15 │
    ├─────┼─────┤
  4 │   7 │  14 │
    ├─────┼─────┼─────┤
  3 │   6 │   8 │  13 │
    ├─────┼─────┼─────┼─────┤
  2 │   2 │   5 │   9 │  12 │
    ├─────┼─────┼─────┼─────┼─────┤
  1 │   1 │   3 │   4 │  10 │  11 │
    └─────┴─────┴─────┴─────┴─────┘
       1     2     3     4     5
```
<p align="center"><b>Figura 1.23.</b> Primeros 15 pasos de Dora la Exploradora en el tablero triangular.</p>

En el décimo paso, la colocó en la casilla $(4, 1)$, mientras que el número 15 lo hizo en la casilla $(1, 5)$.

Ahora, la tarea consiste en determinar la cantidad de pasos que debe dar Dora la Exploradora en su recorrido para alcanzar la casilla $(x, y)$ del tablero triangular. Se debe asumir que se tiene que dar un paso para alcanzar la casilla $(1, 1)$, el cual es el punto de partida en el tablero triangular. Adicionalmente, se debe considerar que el tablero triangular es lo suficientemente grande como para admitir las coordenadas de cualquier casilla.

---

## Formato de entrada

La entrada del problema consiste de múltiples casos de prueba. Cada caso consiste de una línea que contiene un par de números enteros positivos $x, y$, que indican las coordenadas de la casilla con el valor de columna y fila respectivamente. Entre ellos debe haber un único espacio en blanco. Los valores de la columna y de la fila están en el rango $1 \le x, y \le 2 \cdot 10^9$. La entrada finaliza con una línea que contiene `0 0`, para la cual el programa no debe hacer nada, simplemente finalizar.

## Formato de salida

Por cada caso de entrada, imprimir una línea con el número entero positivo $n$ que indique la cantidad de pasos que debe realizar Dora la Exploradora en su recorrido para alcanzar la casilla.

---

## Ejemplo de entrada

```text
1 1
1 3
4 1
5 1
1 5
1 6
2 5
0 0
```

## Ejemplo de salida

```text
1
6
10
11
15
16
17
```
