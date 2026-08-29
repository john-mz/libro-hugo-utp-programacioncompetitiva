#include <iostream>
using namespace std;

signed long long int obtenerD (signed long long int x, signed long long int y){
    return x + y - 1;
}

bool diagonalPar(signed long long int d){
    if (d % 2 == 0){
        return true;
    }
    return false;
}

long long n_min_no_inclusivo(long long d){
    long long k = d - 1;
    if (k % 2 == 0){
        return ( k / 2 ) * (k + 1);
    }
    return k * ( (k + 1) /2 );
}

long long diferenciaPosiciones(long long x, long long x1){
    return abs(x - x1);
}

long long obtenerN(long long n_min_no_inc, long long pasos_abs){
    return n_min_no_inc + 1 + pasos_abs;
}


int main()
{
    signed long long int x, y;
    while(cin >> x >> y && x > 0 && y > 0){
        signed long long int d = obtenerD(x, y);
        long long x1;
        long long y1;
        if(diagonalPar(d)){
            x1 = 1;
            y1 = d;
        }else{
            x1 = d;
            y1 = 1;
        }
        cout << obtenerN(n_min_no_inclusivo(d), diferenciaPosiciones(x, x1)) << "\n";
    }

    return 0;
}
