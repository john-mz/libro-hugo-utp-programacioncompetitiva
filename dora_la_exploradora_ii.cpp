#include <iostream>
using namespace std;

signed long long int obtenerD (signed long long int x, signed long long int y){
    return x + y - 1;
}

signed long long int rangoMaximo(signed long long int d){
    return ( d * (d + 1) ) / 2; //rango max inclusivo
}

signed long long int rangoMinimo(signed long long int d){
    if (d > 1){
        d -= 1;
    }
    return ( d * (d + 1) ) / 2; //rango min no inclusivo
}

bool diagonalPar(signed long long int d){
    if (d % 2 == 0){
        return true;
    }
    return false;
}

signed long long int diagonalDown(signed long long int d, signed long long int rangoMin, signed long long int objetivoX, signed long long int objetivoY){
    // x = d, y = 1
    signed long long int contador = rangoMin;
    signed long long int x = d;
    signed long long int y = 1;
    while (x > 1) {
        if (x == objetivoX && y == objetivoY){
            return contador;
        }
        x -= 1;
        y += 1;
        contador++;
    }
    return contador;
}
//mela
signed long long int diagonalUp(signed long long int d, signed long long int rangoMin, signed long long int objetivoX, signed long long int objetivoY){
    // x = 1, y = d
    signed long long int contador = rangoMin;
    signed long long int x = 1;
    signed long long int y = d;
    while (y > 1){
        if (x == objetivoX && y == objetivoY){
            return contador;
        }
        x += 1;
        y -= 1;
        contador++;
    }
    return contador;
}

int main()
{
    signed long long int x, y;
    while(cin >> x >> y && x > 0 && y > 0){
        if (x == 1 && y == 1){
            cout << 1 << "\n";
            continue;
        }
        
        signed long long int d = obtenerD(x, y);
        signed long long int rangoMax = rangoMaximo(d);
        signed long long int rangoMin = rangoMinimo(d); // no inclusivo
        if (diagonalPar(d)){
            cout << diagonalUp(d, rangoMin + 1, x, y) << "\n";
        }else{
            cout << diagonalDown(d, rangoMin + 1, x, y) << "\n";
        }
    }

    return 0;
}