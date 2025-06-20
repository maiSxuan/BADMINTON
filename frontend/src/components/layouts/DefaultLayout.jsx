
import Header from "../customer/Header";
import Footer from "../customer/Footer";
function DefaultLayout({children}){
    return (
        <div>
            <Header />
            <div className='containter'>
                <div className='content'>
                    {children}
                </div>
            </div>
            <Footer />
        </div>
    )

}
export default DefaultLayout