import Header from "components/header/Header";

function Layout(props) {
    return(
       <div>
          <Header />
          { props.children }
       </div>
    );
}

export default Layout;
