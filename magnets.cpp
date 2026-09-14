// problema 344A Magnets: https://codeforces.com/problemset/problem/344/A
#include <iostream>
using namespace std;

int main()
{
    int n, xi, xf;
    int c = 0;
    xi = 0;
    cin >> n;
    while(n > 0){
        cin >> xf; //10
        
            //0 , 10
        if (xi != xf){
            c++;
        }
        
        // 10
        xi = xf;
        n--;
    }
    cout << c;

    return 0;
}
