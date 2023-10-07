import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomersService from './RecommendationsService';

const customersService = new CustomersService();

function CustomerCreateUpdate() {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');

    const { pk } = useParams();

    useEffect(() => {
        if(pk)
        {
          customersService.getCustomer(pk).then((c)=>{
            setFirstName(c.first_name);
            setLastName(c.last_name);
            setEmail(c.email);
            setPhone(c.phone);
            setAddress(c.address);
            setDescription(c.description);
          })
        } 
    }, []);

    function handleCreate() {
        customersService.createCustomer(
          {
            "first_name": firstName,
            "last_name": lastName,
            "email": email,
            "phone": phone,
            "address": address,
            "description": description,
        }          
        ).then((result)=>{
          alert("Customer created!");
        }).catch(()=>{
          alert('There was an error! Please re-check your form.');
        });
    }

    function handleUpdate(pk){
        customersService.updateCustomer(
          {
            "pk": pk,
            "first_name": firstName,
            "last_name": lastName,
            "email": email,
            "phone": phone,
            "address": address,
            "description": description,
        }          
        ).then((result)=>{
          console.log(result);
          alert("Customer updated!");
        }).catch(()=>{
          alert('There was an error! Please re-check your form.');
        });
    }

    function handleSubmit(event) {
        if(pk){
          handleUpdate(pk);
        }
        else
        {
          handleCreate();
        }

        event.preventDefault();
    }
    
    return (
        <form onSubmit={handleSubmit}>
        <div className="form-group">
        <label>
            First Name:</label>
            <input className="form-control" type="text" value={firstName}  onChange={event => setFirstName(event.target.value)} />
        
        <label>
            Last Name:</label>
            <input className="form-control" type="text" value={lastName} onChange={event => setLastName(event.target.value)}/>
        
        <label>
            Phone:</label>
            <input className="form-control" type="text" value={phone} onChange={event => setPhone(event.target.value)} />
        
        <label>
            Email:</label>
            <input className="form-control" type="text" value={email} onChange={event => setEmail(event.target.value)} />
        
        <label>
            Address:</label>
            <input className="form-control" type="text" value={address} onChange={event => setAddress(event.target.value)} />
        
        <label>
            Description:</label>
            <textarea className="form-control" value={description} onChange={event => setDescription(event.target.value)} ></textarea>

        <input className="btn btn-primary" type="submit" value="Submit" />
        </div>
        </form>
    );  
}

// class CustomerCreateUpdate extends Component {
//     constructor(props) {
//         super(props);
//         console.log(this.props);
    
//         this.handleSubmit = this.handleSubmit.bind(this);
//     }

//     componentDidMount(){
//         // const { match: { params } } = this.props;
//         const { pk } = useParams();
//         if(pk)
//         {
//           customersService.getCustomer(params.pk).then((c)=>{
//             this.refs.firstName.value = c.first_name;
//             this.refs.lastName.value = c.last_name;
//             this.refs.email.value = c.email;
//             this.refs.phone.value = c.phone;
//             this.refs.address.value = c.address;
//             this.refs.description.value = c.description;
//           })
//         }
//     }

//     handleCreate(){
//         customersService.createCustomer(
//           {
//             "first_name": this.refs.firstName.value,
//             "last_name": this.refs.lastName.value,
//             "email": this.refs.email.value,
//             "phone": this.refs.phone.value,
//             "address": this.refs.address.value,
//             "description": this.refs.description.value
//         }          
//         ).then((result)=>{
//           alert("Customer created!");
//         }).catch(()=>{
//           alert('There was an error! Please re-check your form.');
//         });
//     }

//     handleUpdate(pk){
//         customersService.updateCustomer(
//           {
//             "pk": pk,
//             "first_name": this.refs.firstName.value,
//             "last_name": this.refs.lastName.value,
//             "email": this.refs.email.value,
//             "phone": this.refs.phone.value,
//             "address": this.refs.address.value,
//             "description": this.refs.description.value
//         }          
//         ).then((result)=>{
//           console.log(result);
//           alert("Customer updated!");
//         }).catch(()=>{
//           alert('There was an error! Please re-check your form.');
//         });
//     }

//     handleSubmit(event) {
//         const { match: { params } } = this.props;

//         if(params && params.pk){
//           this.handleUpdate(params.pk);
//         }
//         else
//         {
//           this.handleCreate();
//         }

//         event.preventDefault();
//       }
    
//       render() {
//         return (
//           <form onSubmit={this.handleSubmit}>
//           <div className="form-group">
//             <label>
//               First Name:</label>
//               <input className="form-control" type="text" ref='firstName' />
            
//             <label>
//               Last Name:</label>
//               <input className="form-control" type="text" ref='lastName'/>
            
//             <label>
//               Phone:</label>
//               <input className="form-control" type="text" ref='phone' />
            
//             <label>
//               Email:</label>
//               <input className="form-control" type="text" ref='email' />
            
//             <label>
//               Address:</label>
//               <input className="form-control" type="text" ref='address' />
            
//             <label>
//               Description:</label>
//               <textarea className="form-control" ref='description' ></textarea>
              

//             <input className="btn btn-primary" type="submit" value="Submit" />
//             </div>
//           </form>
//         );
//       }  
// }

export default CustomerCreateUpdate;
